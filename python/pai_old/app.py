from typing import Container
from pandas.io.formats import style
from data_processing import vaulting_heatmap_dict, balances_scattermap_dict, table_dict, jumbotron_dict, revenue_histogram, zero_days
from graphing import vaulting_heatmap, balances_map, data_table, jumbotron
from callbacks import register_callbacks
import dash
import pandas as pd
import dash_core_components as dcc
import dash_html_components as html
import dash_bootstrap_components as dbc
from dash.dependencies import Input, Output
import pprint


import plotly
from client import PAIClient
import data_processing
import plotly.express as px
import datetime
import graphing


'''
import flask
from flask.ext.login import LoginManager
# Exposing the Flask Server to enable configuring it for logging in
server = flask.Flask(__name__)
app = dash.Dash(__name__, server=server,
                title='Example Dash login',
                update_title='Loading...',
                suppress_callback_exceptions=True)

app.layout = html.Div([
    dcc.Location(id='url', refresh=False),
    dcc.Location(id='redirect', refresh=True),
    dcc.Store(id='login-status', storage_type='session'),
    html.Div(id='user-status-div'),
    html.Br(),
    html.Hr(),
    html.Br(),
    html.Div(id='page-content'),
])


# Updating the Flask Server configuration with Secret Key to encrypt the user session cookie
server.config.update(SECRET_KEY=os.getenv('SECRET_KEY'))

# Login manager object will be used to login / logout users
login_manager = flask.LoginManager()
login_manager.init_app(server)
login_manager.login_view = '/login'

# User data model. It has to have at least self.id as a minimum

class User(UserMixin):
    def __init__(self, username):
        self.id = username

@ login_manager.user_loader
def load_user(username):

    return User(username)

'''









# set up the app object
app = dash.Dash(__name__, external_stylesheets=[dbc.themes.SLATE])

# login to PAI
# inception sets the beginning lookback date for the accounts this Client will be looking at
# not having the default lookback be years helps save on data returned and makes app faster
inception = datetime.date(2021, 1, 1)
pai_client = PAIClient(inception=inception)
pai_client.login('jlerman', 'Mockyeahingyeah123')

# load the initial set of reports when loading the app
cash_load_report = pai_client.download_report('ATM Cash Load Report')
balance_report = pai_client.download_report('Daily Balance')
status_report = pai_client.download_report('Terminal Status Report')
daily_transaction_report = pai_client.download_report('Daily Transaction Report')
# need to set an empty filter to get ALL Atms   why, idk.  
devices_report = pai_client.download_report('ATM List', filter_key='F_Status', filter_value='')


graph_background_color = 'rgba(46, 46, 46, 255)'

# testing out mapping
return_val = balances_scattermap_dict(status_report.copy(), devices_report)
map_fig = balances_map(return_val)

# testing out table
return_val = table_dict(daily_transaction_report, balance_report)
print('TABLE DICT RETURN VAL')
print(return_val)
table_fig = data_table(return_val)

# testing out jumbotron
return_val = jumbotron_dict(daily_transaction_report)
stats_header = jumbotron(return_val)


# testing out revenue histogram
revenue_bars = revenue_histogram(daily_transaction_report, balance_report)


'''
stats = [
    dbc.DropdownMenu(
        id='demo-dropdown',
        label="ATM Location",
        children=list(map(lambda x: dbc.DropdownMenuItem(x), daily_transaction_report['Location'].unique().tolist())),
    )
]
stats.extend(stats_header)
'''



# register all the callbacks before creating the app layout
callback_preload_values = {
    'cash_load_report': cash_load_report.copy(),
    'balance_report': balance_report.copy(),
    'terminal_status_report': status_report.copy(),
    'daily_transaction_report': daily_transaction_report.copy()
}
register_callbacks(app, callback_preload_values)

pprint.pprint(
    list(map(lambda x: {'label': x, 'value': x}, daily_transaction_report['Location'].unique().tolist()))
    
)


card_background_color = 'rgba(46, 46, 46, 255)'
# app DOM layout
app.layout = html.Div([dbc.Card(dbc.CardBody([

    # Header Title
    dbc.Row(
        dbc.Col(
            dbc.Card(
                dbc.CardBody(
                    html.H1("Hella ATMs Dashboard",
                    style={
                        'text-align': 'left',
                        'border': None
                    }),
                ), 
                id='headertitle',
                ), 
            width=12
            )
        ),
    html.Br(),
    html.Br(),

    # Date Picker for Vaulting Heatmap
    dbc.Row([dbc.Col(
        dcc.Dropdown(
            className='atm-stats-dropdown',
            id='atm-stats-dropdown',
            placeholder="Filter by Location (defaults all terminals)",
            value='All',
            options=list(
                    map(
                    lambda x: {'label': x, 'value': x}, daily_transaction_report['Location'].unique().tolist()
                    )) + [{'label': 'All', 'value': 'All'}],
        ), width=3)]
    ),
    dbc.Row(id='display-selected-values'),
    html.Hr(),
    html.Br(),
    dbc.Row([
        dbc.Col(
            dcc.DatePickerRange(
                id='heatmap_date_picker',
                min_date_allowed=inception,
                max_date_allowed=datetime.datetime.now(),
                initial_visible_month=datetime.date(2021, 8, 1),
                end_date=datetime.datetime.now(),
                style={'background-color': 'rgba(0,0,0,0.5)'}
            ), 
            width=4
        ),
        
    ]),
    html.Br(),

    # Vaulting Heatmap
    dbc.Row(
        dbc.Col(
            dbc.Card(
                dbc.CardBody(dcc.Graph(id='vaulting_heatmap', figure={})), 
                outline=True,
                color=card_background_color,
            ), 
        width=12)
        ),
    html.Br(),

    # Status Map and Balance Linechart
    dbc.Row([
        # Status Map
        dbc.Col(
            dbc.Card(
                dbc.CardBody(
                    dcc.Graph(
                        id='status_map', 
                        figure=map_fig,
                        #style={"height": 700}
                        )
                    ), 
                outline=True,
                color=card_background_color,
                ), 
            width=4
            ),
        # Balance linechart
        dbc.Col(
            dbc.Card(
                dbc.CardBody(
                    dcc.Graph(id='vaulting_predictor', figure={})
                    ), 
                    outline=True,
                    color=card_background_color,
                ), 
                width=8,
            )
        ]),
    html.Br(),

    # Vaulting Table
    dbc.Row(
        dbc.Col(
            dbc.Card(
                dbc.CardBody(table_fig), 
                outline=True,
                color=card_background_color,
                ), 
            width=12
            )
        ),
    html.Br(),
    # revenue histogram
    dbc.Row(
        dbc.Col(
            dbc.Card(
                dbc.CardBody(
                    dcc.Graph(
                        figure=revenue_bars,
                        id='revenue-historgram')
                    ),
                color=card_background_color
            ), width=12
        ),
    )
    
    

]), style={'margin': '0'})])



app.run_server(host='0.0.0.0', debug=True)
