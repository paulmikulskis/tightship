import time
from sqlalchemy.sql.functions import func
from app_config import * # also import datetime
from . import models
import datetime


def create_atm_log_object(atm_id, datestring, values):
    print('CREATING LOG OBJECT')
    print(atm_id)
    print(datestring)
    print(values)
    return  models.DailyReport(
            terminal_number = atm_id,
            account = values.get('group', ''),
            scrape_time = datetime.datetime.now(),
            log_entry_date = datetime.datetime.strptime(datestring, '%m/%d/%y'),
            location = values.get('location', 'fairyland'),
            balance = values.get('balance', -1.0),
            surcharge_dollar_amount = values.get('surcharges', -1.0),
            transactional_dollar_amount = values.get('transactions', -1.0),
            WDTrxs = values.get('WD Trxs', 0),
            NWDTrxs = values.get('NWD Trxs', 0),
            SurchargeTrxs = values.get('Surcharge Trxs', 0),
            BalanceInquiries = values.get('Balance Inquiries', 0),
            DeniedTrxs = values.get('Denied Trxs', 0),
            reversals = values.get('Reversals', 0),
            withdrawal_amount = values.get('Withdrawal', -1.0),
        )


def daily_log_objects_from_dict_list(dicty):

    objs = []
    for atm_id, datedict in dicty.items():
        for datestring, values in datedict.items():
            objs.append(create_atm_log_object(atm_id, datestring, values))

    return objs



