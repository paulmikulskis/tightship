from datetime import datetime, time, timedelta
from client import PAIClient
from database.driver import DatabaseTalker as database
from database.utils import daily_log_objects_from_dict_list
from data_processing import vaulting_heatmap, update_daily_calculations_table, vaulting_heatmap
import pprint
import plotly.graph_objects as go
import plotly.express as px

def main():
    
    client = PAIClient()
    client.login('jlerman', 'Mockyeahingyeah!')

    client.get_reports_names()

    driver = database()

    cash_load_report = (client.download_report_guid(client.reports['Daily Balance'][0], since=timedelta(weeks=100)))
    
    fig = vaulting_heatmap(cash_load_report, since=timedelta(weeks=12))
    fig.show()

    #update_daily_calculations_table(driver)
    #df = (client.download_report_guid(client.reports['ATM Cash Load Report'][0], since=timedelta(weeks=52)))
    
    #exit()
    #pprint.pprint(client.download_report_guid(client.reports['Daily Transaction Report'][0], since=timedelta(weeks=12)))
    
    
    
    #ret = client.get_daily_reports(since=timedelta(weeks=12), psql_session=driver.psql_session)
    #db_datapoints = daily_log_objects_from_dict_list(ret)
    #driver.insert_daily_log_objects(db_datapoints)

    #heat = vaulting_heatmap(driver.logs_data())




if __name__ == '__main__':
    main()
