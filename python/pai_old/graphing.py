
import plotly.express as px
import plotly.graph_objects as go
import dash_table
import dash_html_components as html
import dash_bootstrap_components as dbc
import pprint
import math
from dash_utils import discrete_background_color_bins

graph_background_color = 'rgba(46, 46, 46, 255)'
textfont_color = 'rgba(219, 244, 255, 255)'
font = {
    'family': 'Courier New, monospace',
    'color': '#d5e8f0'
}


def jumbotron(stats_dict, space=8):
    '''
    Prints the stats cards at the top of the app
    
    :param stats_dict: the dict output from data_processing.jumbotron_dict()
    :param space: how much space this component has to take up in Bootstrap columns
    '''
    pprint.pprint(stats_dict)

    w = len(stats_dict.keys())
    w = math.trunc(space/w)

    table_header = []
    for stat in stats_dict.keys():
        table_header.extend([
            html.Th(stat),
        ])

    money_keys = ['Revenue This Week', 'Interchange Fees']
    cards = []
    for key, stats_vals in stats_dict.items():
        stat = stats_vals['week']
        chng = stats_vals['pct_chng']
        if key in money_keys:
            try:
                stat = float(stat)
                stat = round(stat, 2)
            except:
                pass
            statstring = f'${stat}'
        else:
            try:
                stat = int(stat)
            except:
                pass
            statstring = f'{stat}'

        try:
            print(f'CHANGE={chng}')
            chng = float(chng)
            chng = round(chng, 1)
        except:
            pass

        if 'nan' in str(chng):
            color = '#b5b5b5'
            chng = 'stats not live'
        else:
            if stats_vals['pct_chng'] >= 0:
                pct = chng
                chng = f"↑ {chng}%"
                if stats_vals['direction'] == 1:
                    color = '#55c938'
                else:
                    color = '#c95147'
            else:
                chng = f"↓ {chng}%"
                if stats_vals['direction'] == 1:
                    color = '#55c938'
                else:
                    # color override if negative 100% for bad things
                    if pct == -100.0:
                        print('PCT PCT', pct)
                        color = '#55c938'
                    else:
                        color = '#c95147'

        card = dbc.Card([
                dbc.CardBody(
                    [
                        html.H5(key, className="card-title"),
                        html.H4(
                            statstring,
                            className="card-text",
                        ),
                        html.P(f'{chng} since last quarter', style={'color': color})
                    ]
                ),
            ],
            id='statcards',
        )
        cards.append(dbc.Col(card, width=w))

    return cards



    table_header = [html.Thead(html.Tr([table_header]))]
    

    print(table_row)

    table_body = [html.Tbody(table_row)]

    table = dbc.Table(
        table_header + table_body, 
        bordered=False,
        hover=True,
        responsive=True,
        striped=False,
        borderless=True
    )
    return table

    exit()


def vaulting_heatmap(vaulting_heatmap_dict):
    atm_ids = vaulting_heatmap_dict['atm_ids']
    atm_names = vaulting_heatmap_dict['atm_names']
    daterange = vaulting_heatmap_dict['daterange']
    vault_values = vaulting_heatmap_dict['vault_vaules']

    hovertext = list()
    for yi, yy in enumerate(atm_ids):
        hovertext.append(list())
        for xi, xx in enumerate(daterange):
            hovertext[-1].append('Date: {}<br />T.Num: {}<br />${}'.format(xx, yy, vault_values[yi][xi]))

    spaces = ' '* 5
    atm_names = [label+spaces for label in atm_names]

    # this is an approximation to make heatmap pixels SQUARES
    #figure_height = 70 * len(atm_ids)
    figure_height = 400
    colors = int(len(px.colors.sequential.Magma) * 0.2)
    fig = go.Figure(
        data=go.Heatmap(
            z=vault_values,
            x=daterange,
            y=atm_names,
            colorscale=px.colors.sequential.Cividis[colors:],
            hoverinfo='text',
            text=hovertext,
            colorbar=dict(
                title="Amount Vaulted",
                thicknessmode="pixels",
                thickness=20,
                yanchor="top",
                y=1,
                len=int(figure_height*0.5),
                lenmode="pixels",
                ticks="outside",
            )
        ),
    )

    fig.update_layout(
        title='ATM Vault Amounts Per Day',
        xaxis_nticks=36,
        yaxis=dict(scaleanchor="x", scaleratio=1),
        plot_bgcolor=graph_background_color,
        paper_bgcolor=graph_background_color,
        font = font,
        margin=dict(t=60, b=40),
    )

    fig.layout.height = figure_height


    return fig


def vaulting_predictor_chart(return_dict):
    atm_ids = return_dict['atm_ids']
    atm_balances = return_dict['balance_histories']
    atm_names = return_dict['atm_names']
    daterange = return_dict['daterange']

    figure_height = 400
    spaces = ' '* 5
    y_axis_label = [label+spaces for label in atm_ids]

    fig = go.Figure()

    for i, trace in enumerate(atm_balances):
        fig.add_trace(go.Scatter(
            x=daterange,
            y=trace,
            name=atm_names[i],
            mode='lines',
        ))

    fig.update_layout(
        height=500,
        title='ATM Balances',
        xaxis_nticks=36,
        plot_bgcolor=graph_background_color,
        paper_bgcolor=graph_background_color,
        font = font,
        
        #plot_bgcolor='darkgrey',
    )
    fig.update_xaxes(showgrid=False)
    fig.layout.height = figure_height


    return fig


def balances_map(return_dict):

    balance_toggles = [(0,200), (200, 1600), (1600, 50000)]
    colors = ["crimson", "goldenrod", "lightgreen"]

    fig = go.Figure()
    scale = 10
    traces = []
    for i, tog in enumerate(balance_toggles):

        atms = []
        for atm_id, vals in return_dict.items():
            #print(f'atm at {vals["location"]} has ${vals["balance"]}, toggle_group_MIN={tog[0]}, toggle_group_MAX={tog[1]}')
            if (float(vals['balance']) < tog[1]) and (float(vals['balance']) >= tog[0]):
                atms.append({
                'atm_id': atm_id, 
                'balance': float(vals['balance']), 
                'coords': vals['coordinates'], 
                'location': vals['location']
            })
        hovertext = []
        for atm in atms:
            hovertext.append('{}<br />T.Num: {}<br />${}'.format(atm['location'], atm['atm_id'], atm['balance']))

        fig.add_trace(go.Scattergeo(
            locationmode = 'USA-states',
            lon = [atm['coords'][1] for atm in atms],
            lat = [atm['coords'][0] for atm in atms],
            text = hovertext,
            marker = dict(
                size = [atm['balance']  / scale for atm in atms],
                color = colors[i],
                line_color='rgb(40,40,40)',
                line_width=0.5,
                sizemode = 'area'
            ),
            name = '',
        ))
        fig.update_geos(
            fitbounds='locations',
            center={'lat': 42.364689, 'lon': -71.144279},
            resolution=50, visible=False,
            showland=True, landcolor = 'rgb(222, 222, 222)',
            showcountries=True, countrycolor="Black",
            showsubunits=True, subunitcolor="Grey",
            showocean=True, oceancolor="LightBlue",
        )
    a = 10
    fig.update_layout(
        title = {
            'text': 'ATM Live Map',
            'pad': dict(t=0, r=a, l=a, b=0),
            'y': 0.9
        },
        
        height=400,
        showlegend = False,
        plot_bgcolor=graph_background_color,
        paper_bgcolor=graph_background_color,
        font=font,
        margin=dict(t=0, r=a, l=a, b=0, pad=0),
        autosize=True
    )

    return fig
    exit()


def data_table(balances_df):

    (styles, legend) = discrete_background_color_bins(balances_df.copy(), columns=['Days till Doom'], n_bins=3, ranges=[0,2,6,100])
    table = dash_table.DataTable(
        id='Rate Decay Predictor / Balance Histories Table',
        columns=[{'id': c, 'name': c} for c in balances_df.columns],
        data=balances_df.to_dict('records'),
        style_cell={
            'backgroundColor': graph_background_color,
            'color': 'white',
            'padding': '5px',
            'border-spacing': '20px',
        },
        style_data={
            'border': '0px'
        },
        style_table={'overflowX': 'scroll'},
        style_header={
            'border': '0px',
            'fontWeight': 'bold',
            'borderBottom': '1px solid white'
        },
        style_data_conditional=styles,
        css=[
            {'selector':'table', 'rule' : 'border-collapse: separate; border-spacing: 0 5px; margin-top: 5px;'},                                                                                                        
            {'selector':'td', 'rule' : 'padding-top: 5px; padding-bottom : 5px;'},                                                                                                             
            {'selector':'td:last-child', 'rule':'border-right : 2px solid #747678'},                                                                                                           
            {'selector':'td:first-child', 'rule':'border-left : 2px solid #747678'}
        ]

        
    )

    return table

    dates = return_dict['dates']
    columnames = ['Location', 'Terminal ID', 'Days \'till Doom']
    columnames.extend(dates)

    rows = []
    for atm, vals in return_dict['atms'].items():
        row = [vals['location'], atm, vals['days_till_doom']]
        row.extend(dates)
        rows.append(row)

    '''
    data = {c: {} for c in columnames}
    for atm_id, val in return_dict['atms'].items():
        days_till_doom = val['days_till_doom']
        balances = val['balances']
        if len(list(data['Location'].keys())) < 1:
            last_index = -1
        else:
            last_index = list(data['Location'].keys())[-1]

        data['Location'][last_index] = val['location']
        data['Terminal ID'][last_index] = atm_id
        data['Days \'till Doom'][last_index] = days_till_doom
        for i, d in enumerate(dates):
            data[d][last_index] = balances[i]
    '''

    for row in rows:
        print(row)


    for atm_id, vals in return_dict.items():
        balance = vals['balance']
        color_index = 0
        for i, tog in enumerate(balance_toggles):
            try:
                balance = float(balance)
            except:
                print(
                    'ERROR: Balance value {} from atm {} ({}) could not be cast to float'
                    .format(balance, atm_id, vals['location'])
                )
                exit()
            if balance > tog[0]:
                color_index = i

        fig.add_trace(go.Scattergeo(
            locationmode = 'USA-states',
            lon = [vals['coordinates'][0]],
            lat = [vals['coordinates'][1]],
            text = atm_id,
            marker = dict(
                color = colors[color_index],
                line_color='rgb(40,40,40)',
                line_width=0.5,
                sizemode = 'area'
            ),
            name = 'test'
        ))

        print(
            f'created trace for atm {atm_id}, lon:{vals["coordinates"][0]}, lat:{vals["coordinates"][1]}'
        )
    
    fig.update_layout(
        title_text = 'ATM Live Map',
        showlegend = True,
        geo = dict(
            scope = 'usa',
            landcolor = 'rgb(217, 217, 217)',
        )
    )

    return fig
