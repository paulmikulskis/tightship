import axios from 'axios';
import { CookieJar } from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';
import { logger } from './logger.js';
import qs from 'qs';
import request from 'request';
import FormData from 'form-data';
import { subDays, format } from 'date-fns';
import dfd from "danfojs-node";
import tf from "@tensorflow/tfjs-node";

/**
 * Class to connect to and read from Payment Alliance International
 * The base string for all communications done with this API are via 
 * "https://www.paireports.com/myreports/"
 * 
 * Data is returned in the format of a Danfo Dataframe object.
 * If you want to inspect these manually, you can always call dataframeObject.print()
 * and it will print nice and pretty in the console, making field inspection easy.
 * 
 * CAUTION: Do not send any queries using the sql_query() function except
 * the one approved in this file, or you might get shit on by PAI
 * 
 */
export class PAIClient {


    constructor(inception=subDays(new Date(), 3)) {
        this.inception = inception;
        this.jid = undefined;
        this.baseurl = 'https://www.paireports.com/myreports/';
        this.dataDir = './';
        this.cookies = new CookieJar();
        this.session = axios.create({baseURL: this.baseurl});
        this.reports = {};
        this.pai_filter_keys = {
            'ATM Cash Load Report': 'F_Trx Time',
            'Funds Movement By ATM By Day': 'F_Date Range',
            'Daily Transaction Report': 'F_Settlement Date',
            'Daily Balance': 'F_Settlement Date'            
        };
    };
    
    /**
     * 
     * @param {String} query_string string representing the query to be sent to PAI
     * @returns {JSON} SQL response to query string
     */
    async sql_query(query_string) {
        if (query_string != 'SELECT * FROM ReportConfigs r ORDER BY r.Name') {
            // got yelled at from PAI for poking their database, stick to this query!
            logger.error('issued non standard SQL query against PAI!')
            return undefined;
        }
        var bodyFormData = new FormData();
        bodyFormData.append('query', 'SELECT * FROM ReportConfigs r ORDER BY r.Name')
        const options2 = {
            headers: {
                accept: "*/*",
                'user-agent': 'Mozilla/5.0',
                'content-type': 'application/x-www-form-urlencoded',
                "paiclient-sdk": "1.0.0",
                ...bodyFormData.getHeaders()
            },
        }
        return this.session.post(`Query.event`, bodyFormData, options2)
            .then( response => {
                return response.data;
                //console.log('--------------------------------')
                //console.log('REQUEST: ', response.request)
            })
            .catch( err => {
                console.log(err); 
                return undefined;
            });
    };


    /**
     * 
     * @returns {Dictionary} all report configs {ReportGUID, ConfigData, Name, ExternalName, ReportName, etc}
     */
    async getReportConfigs() {
        return this.sql_query('SELECT * FROM ReportConfigs r ORDER BY r.Name');
    };


    /**
     * @returns {Array} all report names in simple array
     */
    async getReportNames() {
        const reports = await this.getReportConfigs();
        return reports.map(report => report.ReportName)
    };


    /**
     * 
     * @param {String} username the user's username
     * @param {String} password the user's password
     * @param {Boolean} getConfig whether to store the reports GUIDs and Names in this.reports
     */
    async login(username, password, getConfig=true) {
        logger.info(`attempting to log in '${username}' to PAI reports`);
        var bodyFormData = new FormData();
        bodyFormData.append('Username', username);
        bodyFormData.append('Password', password);
        const options = {
            headers: {
                'user-agent': 'Mozilla/5.0',
                'content-type': 'application/x-www-form-urlencoded',
                'accept': 'application/json',
                ...bodyFormData.getHeaders()
            },
        };
        const res = await this.session.post('Login.event', bodyFormData, options);
        this.jid = res.headers['set-cookie'][0].split(';')[0];
        this.session.defaults.headers.Cookie = this.jid;

        if (getConfig) {
            var arr = await this.getReportConfigs();
            if (typeof(arr) === 'string') {
                logger.error(`unable to log in user '${username}'`)
                return false;
            }
            arr.forEach(report => {
                this.reports[report.ReportName] = report.ReportGUID;
            });
        };
        return true;
    };


    /**
     * downloads any report from Payment Alliance International by GUID
     * @param {String} guid 
     * @param {Date} since 
     * @param {Date} till 
     * @param {String} filterValue 
     * @param {String} filterKey 
     * @returns a Danfo dataframe representing the report pulled from the reports API
     */
    async downloadReportByGuid(
        guid, 
        since=undefined, 
        till=new Date(), 
        filterValue=undefined, 
        filterKey=undefined
        ) {
        since = since ? since : this.inception;
        const reportName = Object.keys(Object.fromEntries(
            Object.entries(this.reports).filter(entry => entry[1] === guid)
        ))[0];
        logger.info(`download '${reportName}' GUID:${guid}`);
        
        let dateFilterKey;
        if (this.pai_filter_keys[reportName]) {
            dateFilterKey = this.pai_filter_keys[reportName]
        } else {
            dateFilterKey = 'F_Settlement Date';
        };

        const dateFilterValue = `${format(since, 'MM/dd/yyyy')} - ${format(till, 'MM/dd/yyyy')}`
        var bodyFormData = new FormData();
        bodyFormData.append('ReportGUID', guid);
        //bodyFormData.append('ReportCmd', 'Filter');
        bodyFormData.append('ReportCmd', 'CustomCommand');
        bodyFormData.append('CustomCmdList', 'DownloadCSV');
        bodyFormData.append(dateFilterKey, dateFilterValue);
        console.log(bodyFormData);
        if (filterValue && filterKey) {
            bodyFormData.append(filterKey, filterValue);
        };
        const options = {
            headers: {
                'user-agent': 'Mozilla/5.0',
                'content-type': 'application/x-www-form-urlencoded',
                'accept': '*/*',
                ...bodyFormData.getHeaders()
            },
        };
        const res = await this.session.post('Report.event', bodyFormData, options);
        var data = res.data.split('\n');
        var columnNames = data[0].match(/\"(.*?)\"/g)
            .map(item => 
                item.split('"')[1]
            );
        try {
            let tensor_arr = tf.tensor2d(data.slice(1,-1)
            .map(d => 
                d.match(/\"(.*?)\"/g)
                .map(item => 
                    item.split('"')[1]
                )
            )
        );
        let df = new dfd.DataFrame(tensor_arr, {columns: columnNames})
        return df
        } catch (e) {
            this.logger.info('received empty data array: ', e);
            return undefined;
        };

    };


    async downloadReport(
        reportName, 
        since=undefined, 
        till=new Date(), 
        filterValue=undefined, 
        filterKey=undefined
        ) {
        
        if (this.reports[reportName]) {
            logger.info('Downloading report', this.reports[reportName]);
            return await this.downloadReportByGuid(
                this.reports[reportName],
                since,
                till,
                filterValue,
                filterKey
            );
        } else {
            if (Object.keys(this.reports).length === 0) {
                logger.error('pai client does not have this.reports initialized');
            };
            return undefined;
        };

    };
};
    