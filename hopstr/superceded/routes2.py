from flask import Flask, render_template, g
from functools import wraps
import sqlite3
import pandas.io.sql as sql
import vincent

app = Flask(__name__)
DATABASE = 'ingredients.db'

app.config.update(dict(
    DATABASE='ingredients.db',
    DEBUG=True,
    SECRET_KEY='development key',
    USERNAME='admin',
    PASSWORD='default'
))
app.config.from_object(__name__)

def connect_db():
	return sqlite3.connect(app.config['DATABASE'])

def grouped_bar(dataframe, path):
	viz = vincent.GroupedBar(dataframe)
	viz.axis_titles(x='Hop Name', y='Percent')
	viz.legend(title='Characteristics')
	viz.colors(brew='RdYlGn')
	return viz.to_json(path)

@app.route('/')
def home():
	return render_template('home.html')

@app.route('/about')
def about():
	return render_template('about.html')

@app.route('/hops')
def hops():
	g.db = connect_db()
	hopdf = sql.read_frame('select * from hop where id < 68',g.db,'name')
	hopdf2 = hopdf[['alpha','beta','humulene','caryophyllene','cohumulone','myrcene']]
	hopdf3 = hopdf2[hopdf2['alpha']>10].sort_index(by='alpha',ascending=False)
	viz1 = grouped_bar(hopdf2,'static/viz1.json')
	viz2 = grouped_bar(hopdf3,'static/viz2.json')
	#hop = dict(hopname=hopdf.index,alpha=hopdf.ix[:,'alpha'])
	hop = hopdf2
	g.db.close()
	return render_template('hops.html',hop=hop)

if __name__ == '__main__':
	app.run(debug=True)

