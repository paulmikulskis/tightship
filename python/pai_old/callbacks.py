
from data_processing import vaulting_heatmap_dict, vaulting_rate_decay_dict
from graphing import vaulting_heatmap, vaulting_predictor_chart
import pandas as pd
import pprint
import dash_core_components as dcc
import dash_html_components as html
import dash_bootstrap_components as dbc
import dash_html_components as html
from dash.dependencies import Input, Output
import plotly
from client import PAIClient
import data_processing
import plotly.express as px
import datetime
import graphing


def register_callbacks(app, app_preload_values):

    @app.callback(
        Output(component_id = 'vaulting_heatmap', component_property='figure'),
        [Input(component_id = 'heatmap_date_picker', component_property='start_date'),
        Input(component_id = 'heatmap_date_picker', component_property='end_date')]
    )
    def update_vault_heatmap(start_date, end_date):
        cash_load_report = app_preload_values['cash_load_report'].copy()
        if start_date:
            start_date_object = datetime.datetime.fromisoformat(start_date)
        else:
            start_date_object = (datetime.datetime.now() - datetime.timedelta(weeks=8))
        if end_date:
            end_date_object = datetime.datetime.fromisoformat(end_date)
        else:
            end_date_object = datetime.datetime.now()

        print(f'start date: {start_date_object}, (type: {type(start_date_object)})')
        print(f'start date: {end_date_object}, (type: {type(end_date_object)})')

        data = vaulting_heatmap_dict(cash_load_report.copy(), since=start_date_object, till=end_date_object)
        figure = vaulting_heatmap(data)

        return figure

    @app.callback(
        Output(component_id = 'vaulting_predictor', component_property='figure'),
        [Input(component_id = 'heatmap_date_picker', component_property='start_date'),
        Input(component_id = 'heatmap_date_picker', component_property='end_date')]
    )
    def update_vaulting_predictor(start_date, end_date, group_filter='Massachusetts Accounts'):
        balance_report = app_preload_values['balance_report'].copy()
        cash_load_report = app_preload_values['cash_load_report'].copy()
        atm_id_names_dict = {}
        for i, row in cash_load_report.iterrows():
            atm_id = row.iloc[0]
            atm_group = row.iloc[2]
            if (atm_id not in atm_id_names_dict.keys()) and (atm_group == group_filter):
                atm_id_names_dict[atm_id] = atm_group

        if start_date:
            start_date_object = datetime.datetime.fromisoformat(start_date)
        else:
            start_date_object = (datetime.datetime.now() - datetime.timedelta(weeks=4))
        if end_date:
            end_date_object = datetime.datetime.fromisoformat(end_date)
        else:
            end_date_object = datetime.datetime.now()

        data = vaulting_rate_decay_dict(balance_report, atm_id_names_dict, since=start_date_object, till=datetime.datetime.now())
        fig = vaulting_predictor_chart(data)
        return fig


    @app.callback(
        Output('display-selected-values', 'children'),
        Input('atm-stats-dropdown', 'value'))
    def update_output(value):
        daily_txn = app_preload_values['daily_transaction_report']
        if value == 'All':
            data = data_processing.jumbotron_dict(daily_txn)
        else:
            data = data_processing.jumbotron_dict(daily_txn, atm_location=value)
        fig = graphing.jumbotron(data)
        return fig

