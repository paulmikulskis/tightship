import datetime
from os import name
from sqlalchemy import Column, Integer, String, ForeignKey, Table, DateTime
from sqlalchemy.orm import relationship, backref
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql.expression import true
from sqlalchemy.sql.sqltypes import JSON, Numeric

Base = declarative_base()

class Atm(Base):
    __tablename__ = 'atms'

    terminal_number = Column(Integer, primary_key=True)
    account = Column(String(40))
    last_scrape_time = Column(DateTime)
    location = Column(String)
    street_address = Column(String)
    city = Column(String)
    state = Column(String)
    zip = Column(String)
    status = Column(String)
    first_transaction = Column(DateTime)
    last_transaction = Column(DateTime)
    surcharge = Column(Numeric)


class DailyReport(Base):
    __tablename__ = 'daily_logs'

    id = Column(Integer, primary_key=True)
    terminal_number = Column(String)
    account = Column(String(40))
    scrape_time = Column(DateTime)
    log_entry_date = Column(DateTime)
    group = Column(String)
    location = Column(String)
    # 'vault' or 'withdrawl'
    balance = Column(Numeric)
    surcharge_dollar_amount = Column(Numeric)
    transactional_dollar_amount = Column(Numeric)
    WDTrxs = Column(Integer)
    NWDTrxs = Column(Integer)
    SurchargeTrxs = Column(Integer)
    BalanceInquiries = Column(Integer)
    DeniedTrxs = Column(Integer)
    reversals = Column(Integer)
    withdrawal_amount = Column(Numeric)
    interchange_fee = Column(Numeric)


class DailyCalculation(Base):
    __tablename__ ='daily_calculations'
    
    id = Column(Integer, primary_key=True)
    balance = Column(Numeric)
    terminal_number = Column(String)
    vaulted = Column(Numeric)
    scrape_time = Column(DateTime)
    log_entry_date = Column(DateTime)
    withdrawal_amount = Column(Numeric)
