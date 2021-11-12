import re

from numpy import add
from pandas.core.series import Series
from database.driver import DatabaseTalker
import pprint
import jsonpickle
import os
from database.models import Atm
from datetime import date, datetime, timedelta
import pandas as pd
from database import models
import plotly.express as px
import plotly.graph_objects as go
from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter

graph_background_color = 'rgba(46, 46, 46, 255)'
textfont_color = 'rgba(219, 244, 255, 255)'
font = {
    'family': 'Courier New, monospace',
    'color': '#d5e8f0'
}

geolocator = Nominatim(user_agent="pai_address_lookup")
geocode = RateLimiter(geolocator.geocode, min_delay_seconds=1)
geocache_file = str(os.getcwd()) + '/.cache/atm_geocache'



def zero_days(balances_log):


    atms = {id: {} for id in balances_log['Terminal Number'].unique()}

    for i, b in balances_log.iterrows():
        balance_tog_amnt = 0
        days = 0
        atm_id = b['Terminal Number']
        location = b['Location']
        atms[atm_id]['location'] = location
        bal = b.iloc[2:-1]
        print(bal)
        for index, bal in bal.items():
            try:
                bal = float(bal)
                balance_tog_amnt += bal
                if balance_tog_amnt > 3000 and bal < 1:
                    days += 1
            except:
                continue

        atms[atm_id]['days_zero'] = days
    return atms


def process_daily_reports(balances_log, settlment_log, daily_txns, psql_session=None):
    '''
    This function takes in the Daily Settlement Report from PAI
    in the form of a Pandas Dataframe and returns a python dictionary of sorted information

    :params balances_log: the Daily Balance log in a Pandas Dataframe
    :params settlment_log: the Funds Movement By ATM By Day log in a Pandas Dataframe
    :params starting_balances: a dictionary of ATM IDs and their balances
    :params psql_session: if a PSQL session is passed, the function will check the database
    for previous values to adjust the context of current values, e.g. valuted status
    to start with to determine if they were vaulted or not from this data-pull onwards
    :returns: returns a Python dictionary, keyed by ATM ID with a date dictionary of TXs
    '''
    atms = {}
    for index, log_entry in settlment_log.iterrows():
        #print(log_entry.keys())
        datestring = log_entry['Settlement Date']
        this_atm_terminal_id = log_entry['Terminal']
        date = datetime.strptime(datestring, '%m/%d/%y')

        if not atms.get(this_atm_terminal_id):
            atms[this_atm_terminal_id] = {}
        
        if not atms[this_atm_terminal_id].get(datestring):
            atms[this_atm_terminal_id][datestring] = {}
        
        previousd = date - timedelta(days=1)
        previous_day = f'{previousd.month}/{previousd.day:02d}/{str(previousd.year)[2:]}'
        
        # determine if the machine was valuted on this day or not
        
        new_datestring = f'{date.month:02d}/{date.day:02d}/{str(date.year)[2:]}'
        previous_datestring = f'{previousd.month:02d}/{previousd.day:02d}/{str(previousd.year)[2:]}'
        todays_balance = balances_log.loc[
                balances_log['Terminal Number'] == this_atm_terminal_id
                ][new_datestring].iloc[0]

        if todays_balance == '':
            todays_balance = balances_log.loc[
                balances_log['Terminal Number'] == this_atm_terminal_id
                ][previous_datestring].iloc[0]   
                 
        try:
            todays_balance = float(todays_balance)
            todays_balance = round(todays_balance, 2)
        except Exception as e:
            print(
                'date {} was not found in the "Daily Balance" report '
                'that was supplied to the process_daily_reports() function, '
                'you likely need to pull dates farther back'
                .format(new_datestring), e
            )
            todays_balance = None
        try:
            tx_data_row = daily_txns.loc[
                (daily_txns['Terminal Number'] == this_atm_terminal_id) &
                (daily_txns['Settlement Date'] == datestring)
                ]
        except Exception as e:
            raise Exception(
                'date {} was not found in the "Daily Transaction Report" report '
                'that was supplied to the process_daily_reports() function, '
                'you likely need to pull dates farther back'
                .format(new_datestring), e
            )
        if not atms[this_atm_terminal_id].get(datestring):
            atms[this_atm_terminal_id][datestring] = {}

        atms[this_atm_terminal_id][datestring]['balance'] = todays_balance
        atms[this_atm_terminal_id][datestring]['group'] = log_entry['Group']
        atms[this_atm_terminal_id][datestring]['location'] = log_entry['Location']
        atms[this_atm_terminal_id][datestring]['WD Trxs'] = tx_data_row['WD Trxs'].iloc[0]
        atms[this_atm_terminal_id][datestring]['NWD Trxs'] = tx_data_row['NWD Trxs'].iloc[0]
        atms[this_atm_terminal_id][datestring]['Surcharge Trxs'] = tx_data_row['Surcharge Trxs'].iloc[0]
        atms[this_atm_terminal_id][datestring]['Balance Inquiries'] = tx_data_row['Balance Inquiries'].iloc[0]
        atms[this_atm_terminal_id][datestring]['Denied Trxs'] = tx_data_row['Denied Trxs'].iloc[0]
        atms[this_atm_terminal_id][datestring]['Reversals'] = tx_data_row['Reversals'].iloc[0]
        atms[this_atm_terminal_id][datestring]['Withdrawal'] = tx_data_row['Withdrawal'].iloc[0][1:]

        if log_entry['Settlement Type Descr'] == 'Terminal Surcharge':
            atms[this_atm_terminal_id][datestring]['surcharges'] = round(float(log_entry['Amount'][1:]), 2)
        elif log_entry['Settlement Type Descr'] == 'Terminal Transaction':
            atms[this_atm_terminal_id][datestring]['transactions'] = round(float(log_entry['Amount'][1:]), 2)
        
    return atms


def update_daily_calculations_table(driver: DatabaseTalker):
    '''
    Updates the DailyCalculations table in PSQL.  
    '''
    calcs = {}
    dates_accounted_for = []
    all_atm_ids = driver.atm_ids_from_logs()
    for id in all_atm_ids:
        calcs[id] = []

    logs_objects = driver.logs_data()
    for log in logs_objects:

        # we must fill in (-1) values for atms that didn't exist 
        # as early as this date to keep DB rows congruent
        atms_that_exist_now = list(map(lambda a: a.terminal_number, filter(
            lambda x: x.log_entry_date == log.log_entry_date, logs_objects
        )))

        datestring = log.log_entry_date.strftime('%m/%d/%y')
        print(
            f'Found {len(atms_that_exist_now)} '
            f'ATMs existing in the database on {datestring} : \n{atms_that_exist_now}'
        )

        atms_dont_exist_now = list(set(all_atm_ids) - set(atms_that_exist_now))

        # if we havent gotten to this date yet, create dummy objects for 
        # ATMs that don't have entries on this day
        if log.log_entry_date not in dates_accounted_for:
            for atm_id in atms_dont_exist_now:
                last_balance = list(
                    filter(lambda x: x.balance > 0, calcs[atm_id])
                    )
                last_balance = last_balance[-1].balance if len(last_balance)  > 0 else 0
                dummy_obj = models.DailyCalculation(
                    terminal_number = atm_id,
                    vaulted = 0,
                    scrape_time = datetime.now(),
                    log_entry_date = None,
                    balance = last_balance,
                    withdrawal_amount = 0
                )
                calcs[atm_id].append(dummy_obj)

        last_balance = list(
            filter(lambda x: x.balance > 0, calcs[log.terminal_number])
            )
        last_withdrawl_amnt = last_balance[-1].withdrawal_amount if len(last_balance)  > 0 else 0
        last_balance = last_balance[-1].balance if len(last_balance) > 0 else 0
        if (log.balance + log.withdrawal_amount) > (last_balance + last_withdrawl_amnt):
            vaulted = (log.balance + log.withdrawal_amount) - (last_balance + last_withdrawl_amnt)
        else:
            vaulted = 0

        calcs[log.terminal_number].append(
            models.DailyCalculation(
                terminal_number = log.terminal_number,
                vaulted = vaulted,
                scrape_time = datetime.now(),
                log_entry_date = log.log_entry_date,
                balance = log.balance,
                withdrawal_amount = log.withdrawal_amount
            )
        )
        

        if log.log_entry_date not in dates_accounted_for:
            dates_accounted_for.append(log.log_entry_date)

    exit()


def vaulting_heatmap_dict(
    report, 
    group_filter='Massachusetts Accounts', 
    since=timedelta(weeks=4), 
    till=datetime.now()
    ):
    '''
    Creates a heatmap of when each ATM was vaulted

    :params client: an instance of a PAI Client
    :returns: returns dict representing the vaulting history of the ATMs
    '''
    
    if isinstance(since, timedelta):
        since = (till-since).date()
    else:
        since = since.date()
    till = till.date()


    report['Trx Time'] = report['Trx Time'].apply(
        lambda x: datetime.strptime(x.split(' ')[0], '%m/%d/%y').date()
        )
    report = report.loc[
        report['Group'] == group_filter
        ].sort_values(by='Trx Time')
    report = report.loc[
        (report['Trx Time'] > since) &
        (report['Trx Time'] < till)
    ]
    atm_ids = list(set(report['Terminal Number']))
    vault_values = {key: [] for key in atm_ids}
    daterange = pd.date_range(start=since, end=till, freq='D').date

    #print('daterange = ', daterange[9])
    #print('dataframe = ', report['Trx Time'])
    #print(daterange[7].strftime('%m/%d/%y') == report['Trx Time'].apply(lambda x: x.strftime('%m/%d/%y')))

    heatmap_array = []
    for d in daterange:
        for id in atm_ids:
            df = report.loc[
                (report['Terminal Number'] == id) &
                (report['Trx Time'] == d)
            ]
            if df.empty:
                df = 0
            else:
                df = df['Cash Load'].iloc[0]
                try:
                    df = float(df[1:])
                except ValueError as e:
                    raise ValueError(
                        'had trouble converting values from API Reports'
                        ' to programatic numbers, what a shitty API!', e)
            vault_values[id].append(df)
    for id in atm_ids:
        heatmap_array.append(vault_values[id])
    
    vault_values = heatmap_array
    atm_names = [report.loc[
        report['Terminal Number'] == id
        ].iloc[0].iloc[1] for id in atm_ids]

    return_val = {
        'atm_ids': atm_ids,
        'atm_names': atm_names,
        'vault_vaules': vault_values,
        'daterange': daterange,
    }

    return return_val


def vaulting_rate_decay_dict(
    report, 
    atm_id_names_dict, 
    since=timedelta(weeks=4), 
    till=datetime.now()
    ):
    '''
    
    '''
    
    if isinstance(since, timedelta):
        since = (till-since).date()
    else:
        since = since.date()

    till = till.date()    
    #atm_ids = list(map(lambda x: 'n/a' if x == '' else x, set(report['Terminal Number'])))
    atm_ids = list(atm_id_names_dict.keys())
    atm_locations = []
    for i, r in report.iterrows():
        atm_id = r.iloc[0]
        if atm_id in atm_ids:
            atm_locations.append(r.iloc[1])

    balances = {key: [] for key in atm_ids}
    rates_of_decay = {key: [] for key in atm_ids}
    balances_df = report.iloc[:, 2:].rename(
        lambda x : datetime.strptime(x, '%m/%d/%y'), axis=1
        )
    daterange = pd.date_range(
        start=since, end=(till-timedelta(days=1)), freq='D'
        ).date    
    # for each ATM Terminal:
    for j, row in balances_df.iterrows():
        atm_id = report.iloc[j].iloc[0]
        cut = list(row.loc[since:(till-timedelta(days=1))])
        for i, c in enumerate(cut):
            try:
                cut[i] = float(c)
                cut[i] = round(cut[i], 2)
            except Exception as e:
                cut[i] = 0.00
        if atm_id in atm_ids:
            balances[atm_id] = cut

    if 'n/a' in balances.keys():
        del balances['n/a']
    if '' in balances.keys():
        del balances['']
    
    return_val = {
        'atm_ids': [],
        'balance_histories': [],
    }

    return_val['daterange'] = daterange
    return_val['atm_names'] = list(atm_locations)
    for atm_id, balance_arr in balances.items():
        return_val['atm_ids'].append(atm_id)
        return_val['balance_histories'].append(balance_arr)

    # data check
    #for atm_id, balance_list in balances.items():
    #    print(f'atm id: {atm_id}, balance_list_len: {len(balance_list)}')
    
    return return_val


def balances_scattermap_dict(status_report, devices_report, group='Massachusetts Accounts'):

    # the devices report does not get put into a pandas dataframe, so extract the tuple here:
    columns = devices_report[1]
    devices_report = devices_report[0]
    if group != '':
        devices_report = list(filter(lambda x: x[3] == group, devices_report))
    
    '''
    for d in devices_report:
        print(d[4:-8])
    '''
    atm_ids = [d[2] for d in devices_report]
    locations = [d[4] for d in devices_report]
    # Trying to Dynamically Parse Addresses:
    # parses the address strings out of the devices report, removes and some exprs too
    addresses = list(map(
        lambda y: re.sub(r'(Unit \d?)', '', y), 
        map(
            lambda x: (' '.join(x[5:-11]))+f', {x[-11]}', 
            devices_report
            )
        ))
    try:
        with open(geocache_file) as f:
            geocache = jsonpickle.loads(f.read())
    except Exception as e:
        geocache = {}
    coordinates = {}
    atm_coordiantes = {}
    for i, address in enumerate(addresses):
        if not geocache.get(address):
            geo = geocode(address)
            latitude = geo.latitude
            longitude = geo.longitude
        else:
            print(f'loaded corrdinates for {address} from cachefile')
            latitude = geocache.get(address)[0]
            longitude = geocache.get(address)[1]

        coordinates[address] = [latitude, longitude]    
        atm_coordiantes[atm_ids[i]] = [latitude, longitude]
        #print(f'atm {atm_ids[i]} has coordinates: {latitude}, {longitude}')
    # save cache
    for addy, coords in coordinates.items():
        if addy not in geocache.keys():
            geocache[addy] = coords
    with open(geocache_file, 'w+') as f: 
        f.write(jsonpickle.dumps(geocache))

    return_val = {id: {} for id in atm_ids}

    for i, atm_id in enumerate(atm_ids):
        try:
            balance = status_report.loc[
                status_report['Terminal'] == atm_id
                ]['Balance'].iloc[0]
        except:
            continue
        #print(balance)
        return_val[atm_id] = {
            'coordinates': atm_coordiantes[atm_id],
            'balance': balance,
            'location': locations[i],
        }

    keys = list(return_val.keys())
    for key in keys:
        if len(list(return_val[key].keys())) == 0:
            del return_val[key]

    #pprint.pprint(return_val)
    return return_val


def table_dict(report, balances, group='Massachusetts Accounts'):
    return_val = {}
    return_val['atms'] = {}
    balances_df = balances.iloc[:, 2:-1]
    # calculate average withdrawals
    atm_average_withdrawals = [
        (balances.loc[
            balances['Terminal Number'] == id
            ].iloc[0].iloc[2:-1])
        .replace('[\$,]', '', regex=True).replace(
            '', '-1', regex=True
            ).astype(float).iloc[-2] /
        (
            report.loc[report['Terminal Number'] == id]['Withdrawal']
            )
        .replace('[\$,]', '', regex=True).astype(float).mean()
        for id in balances['Terminal Number']
    ]
    for i, w in enumerate(atm_average_withdrawals):
        try:
            w = float(w)
        except:
            w = -1
        if w < 0:
            w = -1
        atm_average_withdrawals[i] = w

    def convert_df(x):
        try:
            x = float(x)
            return f'${int(x)}'
        except:
            return ''

    balances = balances.iloc[:, :2]
    columns = balances_df.columns.tolist()
    columns = columns[::-1]
    balances_df = balances_df[columns]
    balances_df = balances_df.applymap(
        lambda x: convert_df(x)
        )
    balances = balances.join(balances_df)
    balances.insert(
        loc=2, column='Days till Doom', value=atm_average_withdrawals
        )
    balances = balances[(
        balances['Days till Doom'] >= 0
        )]
    balances['Days till Doom'] = balances[
        'Days till Doom'
        ].apply(lambda x: f'{round(x, 1)}')
    return balances



def revenue_histogram(settlelog, balance_log, group=None, atm_location=None):
    settlelog['Settlement Date'] =  pd.to_datetime(
        settlelog['Settlement Date'], format='%m/%d/%y'
        )
    if group:
        settlelog = settlelog.loc[settlelog['Group'] == group]
    if atm_location:
        settlelog = settlelog.loc[settlelog['Location'] == atm_location]  
      
    quarter = settlelog.loc[
        settlelog['Settlement Date'] > datetime.now() - timedelta(weeks=16)
        ]
    locations = {
        id: {} for id in quarter['Location'].unique()
        }
    print(list(settlelog.columns.values))
    for location in locations.keys():
        rev = pd.to_numeric(
            quarter.loc[
                quarter['Location'] == location
                ]['Surcharge'].replace('[\$,]', '', regex=True)
            ).sum()
        txns = pd.to_numeric(
            quarter.loc[
                quarter['Location'] == location
                ]['Surcharge Trxs']).sum()
        denies = pd.to_numeric(
            quarter.loc[
                quarter['Location'] == location
                ]['Denied Trxs']).sum()
        locations[location]['rev'] = rev
        locations[location]['txns'] = txns
        locations[location]['denies'] = denies


    revenues = [locations[l]['rev'] for l in locations.keys()]
    txns = [locations[l]['txns'] for l in locations.keys()]
    denies = [locations[l]['denies'] for l in locations.keys()]
    locations = list(locations.keys())
    zeros = zero_days(balance_log)
    zero = [zeros[key]['days_zero'] for key in zeros.keys() if zeros[key]['location'] in locations]
    #zippy = list(zip(locations, revenues))
    #histogram = pd.DataFrame(
    #    zippy, columns=['Location', 'Revenue']
    #)

    fig = go.Figure(data=[
        go.Bar(
            name='Revenue', 
            x=locations, 
            y=revenues,
            yaxis='y', 
            offsetgroup=1,
            hovertemplate = "Revenue:<br> %{x} </br>$%{y}<extra></extra>",
            marker_color = 'rgba(79, 143, 77, 0.78)',
            marker_line_color='rgba(79, 143, 77, 0.95)',
            marker_line_width=1.5,
            
        ),
        go.Bar(
            name='Txn Count', 
            x=locations, 
            y=txns,
            yaxis='y', 
            offsetgroup=2,
            hovertemplate = "# Surcharge Txns <br> %{x} </br> %{y} txns<extra></extra>",
            marker_color='rgba(70, 83, 130, 0.78)',
            marker_line_color='rgba(70, 83, 130, 0.95)',
            marker_line_width=1.5,
        ),
        go.Bar(
            name='Denied Txns', 
            x=locations, 
            y=denies,
            yaxis='y2', 
            offsetgroup=3,
            hovertemplate = "# Denied Txns:<br> %{x} </br> %{y} txns<extra></extra>",
            marker_color='rgba(166, 103, 8, 0.78)',
            marker_line_color='rgba(166, 103, 8, 0.95)',
            marker_line_width=1.5,
        ),
        go.Bar(
            name='Days at $0', 
            x=locations, 
            hovertemplate = "Days at $0:<br> %{x} </br> %{y} days<extra></extra>",
            y=zero,
            yaxis='y2', 
            offsetgroup=4,
            marker_color='rgba(163, 28, 13, 0.78)',
            marker_line_color='rgba(163, 28, 13, 0.95)',
            marker_line_width=2
        )
    ])

    """    
    fig = px.histogram(
        histogram, 
        x='Location', 
        y='Revenue',
        
        )
    """
    fig.update_layout(
        barmode='group',
        title = {
            'text': 'Fleet Statistics',
            'pad': dict(t=40, r=30, l=15, b=60),
        },
        bargap=0.2,
        yaxis=dict(
            gridcolor='rgba(69, 69, 69, 0.34)',
            title=''
        ),
        bargroupgap = 0.1,
        yaxis2=dict(
            title='', 
            overlaying='y', 
            side='right',
            gridcolor='rgba(69, 69, 69, 0.34)',
        ),
        height=400,
        showlegend = True,
        plot_bgcolor=graph_background_color,
        paper_bgcolor=graph_background_color,
        font=font,
        margin=dict(t=40, r=15, l=15, b=60),
        autosize=True,
    )
    return fig




def jumbotron_dict(settlelog, group='Massachusetts Accounts', atm_location=None):

    print(settlelog)
    settlelog['Settlement Date'] =  pd.to_datetime(
        settlelog['Settlement Date'], format='%m/%d/%y'
        )
    if group:
        settlelog = settlelog.loc[settlelog['Group'] == group]
    if atm_location:
        settlelog = settlelog.loc[settlelog['Location'] == atm_location]
    
    
    this_week = settlelog.loc[
        settlelog['Settlement Date'] > datetime.now() - timedelta(weeks=1)
        ]
    this_quarter = settlelog.loc[
        settlelog['Settlement Date'] > datetime.now() - timedelta(weeks=16)
        ]
    this_year = settlelog.loc[
        settlelog['Settlement Date'] > datetime.now() - timedelta(weeks=52)
        ]


    profit_this_week = pd.to_numeric(
        this_week['Surcharge'].replace('[\$,]', '', regex=True)
        ).sum()
    profit_this_quarter = (
        pd.to_numeric(
            this_quarter['Surcharge'].replace('[\$,]', '', regex=True)
            ).sum()) / 16
    profit_pct_chng = round(
        ((profit_this_week - profit_this_quarter) / profit_this_quarter), 3
        ) * 100

    denials_this_week = pd.to_numeric(this_week['Denied Trxs']).sum()
    denials_this_quarter = (
        pd.to_numeric(this_quarter['Denied Trxs']).sum()
        ) / 16
    denials_pct_chng = round(
        ((denials_this_week - denials_this_quarter) / denials_this_quarter)
        , 3) * 100

    interchange_this_week = pd.to_numeric(
        this_week['Interchange'].replace('[\$,]', '', regex=True)
        ).sum()
    interchange_this_quarter = pd.to_numeric(
        this_quarter['Interchange'].replace('[\$,]', '', regex=True)
        ).sum()
    interchange_pct_chng = round(
        ((interchange_this_week - interchange_this_quarter) / interchange_this_quarter),
         3) * 100

    surcharge_this_week = pd.to_numeric(
        this_week['Surcharge Trxs']
        ).sum()
    surcharge_this_quarter = (
        pd.to_numeric(this_quarter['Surcharge Trxs']).sum()
        ) / 16
    surcharge_pct_chng = round(
        ((surcharge_this_week - surcharge_this_quarter) / surcharge_this_quarter)
        , 3) * 100

    return {
        'Revenue This Week': {
            'week': profit_this_week,
            'quarter': profit_this_quarter,
            'pct_chng': profit_pct_chng,
            'direction': 1
        },
        'Denied Txns': {
            'week': denials_this_week,
            'quarter': denials_this_quarter,
            'pct_chng': denials_pct_chng,
            'direction': -1
        },
        'Interchange Fees': {
            'week': interchange_this_week,
            'quarter': interchange_this_quarter,
            'pct_chng': interchange_pct_chng,
            'direction': 1
        },
        'Surcharge Txns': {
            'week': surcharge_this_week,
            'quarter': surcharge_this_quarter,
            'pct_chng': surcharge_pct_chng,
            'direction': 1
        },

    }
    exit()


    