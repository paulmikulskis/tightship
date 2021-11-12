import pathlib
import re
import requests
import logging
from requests.api import head
from datetime import datetime, timedelta, date
import csv
import pprint
import shutil
import pandas as pd
from data_processing import *


def pretty_print_POST(req):
    """
    At this point it is completely built and ready
    to be fired; it is "prepared".

    However pay attention at the formatting used in 
    this function because it is programmed to be pretty 
    printed and may differ from the actual request.
    """
    print('{}\n{}\r\n{}\r\n\r\n{}'.format(
        '-----------START-----------',
        req.method + ' ' + req.url,
        '\r\n'.join('{}: {}'.format(k, v) for k, v in req.headers.items()),
        req.body,
    ))


class PAIClient():

    def __init__(self, inception=date(2021, 1, 1)):
        self.inception = inception
        self.session = requests.Session()
        logging.basicConfig(
            format='%(asctime)s %(name)-20s %(levelname)-8s %(message)s',
            level=logging.DEBUG,
            datefmt='%d/%m %H:%M:%S'
        )
        logging.getLogger('urllib3.connectionpool').setLevel(logging.ERROR)
        self.logger = logging.getLogger(__name__)
        self.jid = None
        self.baseurl = 'https://www.paireports.com/myreports/'
        self.data_directory = '/Users/pmikulskis/.paireports'

        # Interesting Reports to keep, just cuz
        self.funds_movements = 'Funds Movement By ATM By Day'
        self.pai_datefilter_keys = {
            'ATM Cash Load Report': 'F_Trx Time',
            'Funds Movement By ATM By Day': 'F_Date Range',
            'Daily Transaction Report': 'F_Date Range',
            'Daily Balance': 'F_Settlement Date'
        }

    def login(self, username, password):
        self.logger.info('attempting to log in user {} to PAI reports'.format(username))
        url = self.baseurl + 'Login.event'
        data = {
            'Username': username,
            'Password': password
        }
        headers = {
            'User-Agent': 'Mozilla/5.0',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
        }
        r = requests.post(url, data=data, headers=headers)
        print(r.request._cookies)
        # check to make sure login was successful
        if r.json().get('@response-type') == 'ErrorMessage':
            self.logger.error(
                'PAI login credentials username: {}, password: {}  are INCORRECT'
                .format(username, password)
            )
            exit()
        #print(r.json())
        self.logger.info('PAI Reports login success!')
        self.jid = r.json().get('JSESSIONID')

        # set future sessions to have the right basic haeders and cookies
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0',
            'Content-Type': 'application/x-www-form-urlencoded',
            "PAIClient-SDK": "1.0.0"
        })
        self.session.cookies.update({
            'JSESSIONID': self.jid
        })
        self.get_reports_dictionary()


    def sql_query(self, query_string):
        self.logger.info('running SQL query: {}'.format(query_string))
        url = self.baseurl + 'Query.event'
        params = {
            "query": query_string
        }
        extra_headers = {
            "Accept": "*/*"
        }

        r2 = self.session.post(url, data=params, headers=extra_headers)
        #pretty_print_POST(r2.request)
        #print(r2.json())
        return r2.json()


    def get_reports_dictionary(self):
        '''
        Gets all the report names and associated GUIDs from PAI

        :returns: returns a Dict[report_name, GUID]
        '''
        result = self.sql_query('SELECT * FROM ReportConfigs r ORDER BY r.Name')
        reports = {}
        for res in result:
            if reports.get(res.get('ReportName')):
                reports[res.get('ReportName')].append(res.get('ReportGUID'))
            else:
                reports[res.get('ReportName')] = [res.get('ReportGUID')]

        self.reports = reports
        #pprint.pprint(reports)
        return reports


    def get_reports_names(self):
        '''
        Gets a simple list of all reports names
        '''
        result = self.sql_query('SELECT * FROM ReportConfigs r ORDER BY r.Name')
        lil = [a.get('ReportName') for a in result]
        for l in lil:
            print(l)
        return lil


    def download_report(self, name, since=None, till=datetime.now(), filter_key=None, filter_value=None):
        since = since if since else self.inception
        return self.download_report_guid(self.reports[name][0], since=since, till=till, filter_key=filter_key, filter_value=filter_value)


    def download_report_guid(self, guid, since=None, till=datetime.now(), filter_key=None, filter_value=None):
        since = since if since else self.inception
        if isinstance(since, timedelta):
            since = datetime.now() - since
        if isinstance(till, timedelta):
            till = datetime.now() - till

        name = [key for key, value in self.reports.items() if guid in value]
        if len(name) > 0:
            name = name[0]
        else:
            self.logger.error(f'report {guid} not found')
            exit()
        
        
        if self.pai_datefilter_keys.get(name):
            date_filterkey = self.pai_datefilter_keys.get(name)
        else:
            date_filterkey = 'F_Settlement Date'
        
        #print(f'filter key is configured to be {filter_key}')
        datefilter = (
            f'{since.month:02d}/{since.day:02d}/{since.year} - {till.month:02d}/{till.day:02d}/{till.year}'
        )
        self.logger.info('download report {}'.format(name))
        url = self.baseurl + 'Report.event'

        params = {
            'ReportGUID': guid,
            'ReportCmd': 'Filter',
            'ReportCmd': 'CustomCommand',
            'CustomCmdList': 'DownloadCSV',
            date_filterkey: datefilter,
            filter_key: filter_value
        }
        extra_headers = {
            "Accept": "*/*"
        }
        
        filename = (f'{self.data_directory}/{"".join(name.split())}_{datetime.now().strftime("%d_%m_%y")}')
        r = self.session.post(url, data=params, headers=extra_headers)
        decoded = r.content.decode('utf-8')
        decoded = decoded.splitlines()
        columns = [c.strip('"') for c in decoded[0].split(',')]
        decoded = decoded[1:]
        data = [d.split(',') for d in decoded]
        if len(data) == 0:
            self.logger.error('empty data received from API.  This sometimes happens with this old ass piece of shit API.  Try re-running :p')
        
        # we have to do all this bullshit because this PITA PAI API returns 
        # dollar amounts with "$1,203" aka with commas...for CSV files ... NICE
        midd = []
        for i, row in enumerate(data):
            rowp = []
            skips=1
            for j, item in enumerate(row):
                item = item.strip('"')
                if j == 0:
                    rowp.append(item)
                else:
                    previous_item = rowp[j-skips]
                    res1 = re.compile('^([\d]+[\.])?[\d]+$')
                    res2 = re.compile('^\$[\d]+$')
                    if res2.search(previous_item) and res1.search(item):
                        rowp[j-skips] = previous_item + item
                        skips += 1
                    else:
                        rowp.append(item)
            midd.append(rowp)
        data = midd

        # now that we are done with that above BS, let us create the dataframe
        try:
            df = pd.DataFrame(data, columns = columns)
        except Exception as e:
            df = data, columns
            self.logger.warning(
                'tried to put report "{}" in a Pandas Dataframe, but row lengths are not congruent, returning Tuple'
                .format(name)
            )
        #print(df)
        self.logger.info(f'finished download report {filename}.csv')
        return df
        

    def get_daily_reports(self, since=None, psql_session=None):
        '''
        Gets a list of all the daily reports of all ATMs, including when they
        were vaulted

        :param since: date from whence to check
        :returns: returns a python dict with the stuff
        '''
        since = since if since else self.inception
        guids = self.reports.get('Daily Balance')
        guids2 = self.reports.get('Funds Movement By ATM By Day')
        guids3 = self.reports.get('Daily Transaction Report')

        balances = self.download_report_guid(guids[0], since=since)
        log_daily = self.download_report_guid(guids2[0], since=since)
        daily_txns = self.download_report_guid(guids3[0], since=since)

        return process_daily_reports(balances, log_daily, daily_txns, psql_session=psql_session)
