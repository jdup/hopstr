# -*- coding: utf-8 -*-
# <nbformat>3.0</nbformat>

# <codecell>

import vincent
import routes
import sqlite3
import vincent.ipynb
import pandas as pd
vincent.ipynb.init_d3()
vincent.ipynb.init_vg()

# <codecell>

db = sqlite3.connect('ingredients.db')

# <codecell>

cur = db.execute('select name, alpha, beta, myrcene, humulene, cohumulone from HOP where id < 63 order by alpha')
hop = [dict(hopname=row[0],alpha=row[1],beta=row[2],myrcene=row[3],humulene=row[4],cohumulone=row[5]) for row in cur.fetchall()]

# <codecell>

hopnames = [ihop['hopname'] for ihop in hop]
df_hop = pd.DataFrame(hop, index=hopnames)
    

# <codecell>

df_hop = df_hop.drop('hopname',1)


# <codecell>


# <codecell>

lowalpha = df_hop[:10]
df_hop = df_hop.sort_index(by='alpha',ascending=False)
highalpha = df_hop[:10]
selecthops = df_hop.loc[['Cascade','Chinook'],:]

# <codecell>

stacked = vincent.GroupedBar(lowalpha)
stacked.axis_titles(x='Hop Name', y='Percent')
stacked.legend(title='Characteristics')
stacked.colors(brew='Set1')
stacked.name = "Low Alpha"


# <codecell>

viz2 = vincent.GroupedBar(highalpha)
viz2.axis_titles(x='Hop Name', y='Percent')
viz2.legend(title='Characteristics')
viz2.colors(brew='RdYlBu')
viz2.name = "High Alpha"


# <codecell>

viz3 = vincent.GroupedBar(selecthops)
viz3.axis_titles(x='Hop Name', y='Percent')
viz3.legend(title='Characteristics')
viz3.colors(brew='RdYlGn')
viz3.name = "Selected Hops"
viz3.to_json("selecthopschart.json")

# <codecell>


