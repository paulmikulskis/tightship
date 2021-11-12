import datetime
import socket
import logging
from numpy import mod
from sqlalchemy.engine import create_engine
from sqlalchemy.orm.session import sessionmaker
from app_config import Config
from . import models


class DatabaseTalker():


    def __init__(self):
        self.psql_session = self.get_psql_session()
        self.models = models
        self.logger = logging.getLogger(__name__)
        self.create_psql_tables()


    def get_psql_session(self):
        '''
        Returns an authenticated PSQL session to the database configured by
        the environment variable DATA_COLLECTOR_DATABASE.  You can set the 
        password and domain with DATA_COLLECTOR_DATABASE_PASSWORD and
        DATA_COLLECTOR_DATABASE, respectively
        '''
        # hold back the sqlalchemy engine logs, they are noisy
        logging.getLogger('sqlalchemy.engine').setLevel(
            logging.DEBUG if Config.DEBUG else logging.WARNING
        )
        host = ''
        try:
            host = socket.gethostbyname(Config.DOMAIN)
        except socket.gaierror as e:
            raise Exception(
                'driver {} tried connecting to {} but hostname "{}" was bad, check app config'
                .format(self.yconf['UUI'], Config.DATA_COLLECTOR_DATABASE, Config.DOMAIN,)
            )

        try:
            engine = create_engine(
                'postgresql://{}:{}@{}/{}'.format(
                    Config.DATA_COLLECTOR_DATABASE,
                    Config.DATA_COLLECTOR_DATABASE_PASSWORD,
                    host,
                    Config.DATA_COLLECTOR_DATABASE,
                ), 
                echo=False
            )
        except Exception as e:
            raise Exception(
                'driver {} tried connecting to {} but credentials "{}, {}***" was bad, check app config'
                .format(
                    self.yconf['UUI'], 
                    Config.DOMAIN,
                    Config.DATA_COLLECTOR_DATABASE, 
                    Config.DATA_COLLECTOR_DATABASE_PASSWORD[:4]
                ), e
            )

        Session = sessionmaker(bind=engine)
        self.psql_session = Session()
        return self.psql_session


    def create_psql_tables(self):
        '''
        Constructs the PSQL all tables present in the list of models.

        :param models: list of classes from the database module
        :return: returns nothing
        '''

        logging.getLogger('sqlalchemy.engine.Engine').setLevel(logging.INFO if Config.PSQL_DEBUG_LOGS else logging.WARNING)
        engine = self.psql_session.get_bind()
        #logging.getLogger('sqlalchemy.engine.Engine').setLevel(logging.ERROR)
        try:
            self.models.Base.metadata.create_all(engine)
            # indent by one space 
            self.logger.info(f' - postgres models created for {str(models.__name__)}')
        except Exception as e:
            logging.getLogger('psql').exception(e)
        self.logger.info('Finished making postgres metadata')


    def atm_terminal_datapoint_exists(self, terminal_number, account):
        '''
        Determines whether an ATM with the given terminal ID and account ID already exists
        in the database
        '''

        atm_object = self.psql_session.query(models.Atm).where(
            (
                (models.Atm.terminal_number == terminal_number) &
                (models.Atm.account == account)
            )
        ).first()
        if not atm_object:
            return None
        else:
            atm_object.scrape_time = datetime.datetime.now()
            return atm_object


    def daily_log_object_exists(self, terminal_number, date):

        log_object = self.psql_session.query(models.DailyReport).where(
            (
                (models.DailyReport.terminal_number == terminal_number) &
                (models.DailyReport.log_entry_date == date)
            )
        ).first()
        if not log_object:
            return None
        else:
            log_object.scrape_time = datetime.datetime.now()
            return log_object

    
    def insert_daily_log_object(self, daily_log_object):

        if self.daily_log_object_exists(
            daily_log_object.terminal_number, 
            daily_log_object.log_entry_date
        ):
            return False
        else:
            self.psql_session.add(daily_log_object)
            self.psql_session.commit()
            return True

    
    def insert_daily_log_objects(self, daily_log_object_list):

        for log in daily_log_object_list:
            if self.daily_log_object_exists(
                log.terminal_number, 
                log.log_entry_date
            ):
                continue
            else:
                self.psql_session.add(log)
        self.psql_session.commit()
        return True


    def logs_data(self, since=datetime.timedelta(weeks=12)):
        '''
        Gets all log data from ATMs increasing by date 
        '''
        if isinstance(since, datetime.timedelta):
            since = datetime.datetime.now() - since

        print(since)

        data = self.psql_session.query(models.DailyReport).where(
                models.DailyReport.log_entry_date >= since
            ).order_by(models.DailyReport.log_entry_date.asc()).all()

        return data


    def calculations_data(self):
        data = self.psql_session.query(
                models.DailyCalculation
            ).order_by(models.DailyCalculation.log_entry_date.asc()).all()

        return data


    def atm_ids_from_logs(self):
        db_machine_ids = self.psql_session.query(
                models.DailyReport
            ).distinct(models.DailyReport.terminal_number).all()
        if db_machine_ids:
            db_machine_ids = list(map(lambda x: x.terminal_number, db_machine_ids))
            return db_machine_ids
        else:
            return []
