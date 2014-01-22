from flask_sqlalchemy import SQLAlchemy
from hopstr import app

db = SQLAlchemy(app)

class Hop(db.Model):
	id = db.Column(db.Integer, primary_key = True)
	name = db.Column(db.String(256), unique=False)
	alpha = db.Column(db.Numeric, unique=False)
	beta = db.Column(db.Numeric)
	humulene = db.Column(db.Numeric)
	caryophyllene = db.Column(db.Numeric)
	cohumulone = db.Column(db.Numeric)
	myrcene = db.Column(db.Numeric)

	def __init__(self,name,alpha,beta,humulene,caryophyllene,cohumulone,myrcene):
		self.name = name
		self.alpha = alpha
		self.beta = beta
		self.humulene = humulene
		self.caryophyllene = caryophyllene
		self.cohumulone = cohumulone
		self.myrcene = myrcene

	def __repr__(self):
		return '<Name %r>' % self.name
