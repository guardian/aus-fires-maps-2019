#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#%%
import pandas as pd
from shapely.geometry import Point, shape
import simplejson as json
#%%

df = pd.read_csv('fire_nrt_M6_87695.csv', dtype={'acq_time': object})

with open('bounding.json') as f:
	areas = json.load(f)

for area in areas['features']:

	def checkPos(row):
		polygon = shape(area['geometry'])
		point = Point(row.longitude, row.latitude)
		if polygon.contains(point):
			return True
		else:
			return False	
			
	df['inBounds'] = df.apply(checkPos, axis=1)  

	within = df[df['inBounds'] == True]
	within = within[within['confidence'] > 33]
	within['time'] = within['acq_date'] + " " + within['acq_time']
	within['date'] = pd.to_datetime(within['acq_date'])

	within = within[within['date'] > area['properties']['startDate']]

	within = within[['latitude','longitude','time']]
	within.to_csv('../src/assets/{filename}.csv'.format(filename=area['properties']['name'].replace(" ", "_")), index=False)


#df['time'] = pd.to_datetime(df['time'],format="%Y-%m-%d %H%M")
#
#df['time'] = df['time'].dt.tz_localize('UTC').dt.tz_convert('Australia/Sydney')
#
#df['time'] = df['time'].dt.strftime("%Y-%m-%d %H%M")



#%%

# df2 = pd.read_csv('fire_nrt_M6_86677.csv', dtype={'acq_time': object})

#%%^

# boundsLon = [147,154]
# boundsLat = [-24,-34]

# def checkPos(row):
#     if row.latitude <= boundsLat[0] and row.latitude >= boundsLat[1] and row.longitude <= boundsLon[1] and row.longitude >= boundsLon[0]:
#         return True
#     else:
#         return False
	
# df2['inBounds'] = df2.apply(checkPos, axis=1)

# df2 = df2[df2['inBounds'] == True]

# df2 = df2[df2['confidence'] > 33]

# df2['time'] = df2['acq_date'] + " " + df2['acq_time']

# newdf2 = df2[['latitude','longitude','time']]

# newdf2.to_csv('src/assets/mapdata2.csv', index=False)