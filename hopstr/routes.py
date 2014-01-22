from flask import Flask, render_template, g
from functools import wraps
import sqlite3
import pandas.io.sql as sql
import pandas
import vincent

from hopstr import app
DATABASE = 'hopstr/ingredients.db'

def connect_db():
	with app.app_context():
		return sqlite3.connect(app.config['DATABASE'])

def grouped_bar(dataframe, path):
	viz = vincent.GroupedBar(dataframe)
	viz.axis_titles(x='Hop Name', y='Percent')
	#viz.legend(title='Characteristics')
	viz.colors(brew='Spectral')
	viz.to_json(path)
	return viz

def stacked_bar(dataframe, path):
	viz = vincent.StackedBar(dataframe)
	viz.axis_titles(x='Hop Name', y='Percent')
	viz.legend(title='Characteristics')
	viz.colors(brew='Spectral')
	viz.to_json(path)
	return viz

def stacked_area(dataframe, path):
	viz = vincent.StackedArea(dataframe)
	viz.axis_titles(x='Hop Name', y='Percent')
	viz.legend(title='Characteristics')
	viz.colors(brew='Spectral')
	viz.to_json(path)
	return viz

def init_hops():
	g.db = connect_db()
	hopdf = sql.read_frame('select * from hop where id<63',g.db,'name')
	hopdf = hopdf[['alpha','beta','humulene','caryophyllene','cohumulone','myrcene','notes','origin','substitutes']]
	hopdf.to_csv('hopstr/static/hops.csv',index=True, cols=['alpha','beta','humulene','caryophyllene','cohumulone','myrcene'],header=['alpha','beta','humulene','caryophyllene','cohumulone','myrcene'])
	g.db.close()
	return hopdf

@app.route('/')
def home():
	return render_template('home.html')

@app.route('/about')
def about():
	return render_template('about.html')

@app.route('/hops')
def hops():
	hopdf = init_hops()
	selectdf = hopdf
	chartdf = selectdf.drop(['notes','origin','substitutes'],axis=1)
	vizpath = 'hopstr/static/viz.json'
	viz = grouped_bar(chartdf,vizpath)
	return render_template('hops.html',hop = selectdf,vizpath = vizpath)

@app.route('/hops/<hopname>')
def select_hops(hopname):
	hopdf = init_hops()
	selectdf = hopdf.loc[hopname]
	chartdf = selectdf.drop({'notes','origin','substitutes'})
	vizpath = 'hopstr/static/viz.json'
	viz = grouped_bar(chartdf, vizpath)
	return render_template('hopschart3.html', hop=selectdf, vizpath=vizpath)

@app.route('/hops/compare/<hopnames>')
def compare_hops(hopnames):
	hopnamelist = hopnames.split('&')
	hopdf = init_hops()
	selectdf = hopdf.loc[hopnamelist]
	chartdf = selectdf.drop(['notes','origin','substitutes'],axis=1)
	vizpath = 'hopstr/static/viz.json'
	viz = stacked_bar(chartdf, vizpath)
	return render_template('hops.html',hop = selectdf, hopnamelist = hopnamelist, vizpath = vizpath)

@app.route('/hops/rank')
def rank_hops():
	hopdf = init_hops()
	return render_template('rankhops.html',hop=hopdf)


if __name__ == '__main__':
	app.run(debug=True)

