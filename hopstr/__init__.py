from flask import Flask, request, session, g, redirect, render_template
from sqlite3 import dbapi2 as sqlite3
from functools import wraps
import pandas.io.sql as sql
import vincent
# create the application

app = Flask(__name__)

'''from flask.ext.sqlalchemy import SQLAlchemy
app.config.from_object('config')
db = SQLAlchemy(app)
'''

import routes, models

# Load default config and override config from an environment variable
app.config['SQLALCHEMY_DATABASE_URI']= 'ingredients.db'


app.config.update(dict(
    DATABASE='hopstr/ingredients.db',
    DEBUG=True,
    SECRET_KEY='development key',
    USERNAME='admin',
    PASSWORD='default'
))

app.config.from_object('hopstr')


def connect_db():
    """Connects to the specific database."""
    rv = sqlite3.connect(app.config['DATABASE'])
    rv.row_factory = sqlite3.Row
    return rv



def init_db():
	with app.app_context():
		db = get_db()
		with app.open_resource('create_db.sql',mode='r') as f:
			db.cursor().executescript(f.read())
		db.commit()

def get_db():
    """Opens a new database connection if there is none yet for the
    current application context.
    """
    if not hasattr(g, 'sqlite_db'):
        g.sqlite_db = connect_db()
    return g.sqlite_db



@app.teardown_appcontext
def close_db(error):
    """Closes the database again at the end of the request."""
    if hasattr(g, 'sqlite_db'):
        g.sqlite_db.close()



if __name__ == '__main__':
    #connect_db()
    app.run()
