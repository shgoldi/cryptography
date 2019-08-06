# cryptography
Cryptography_Project_jQuery_Ajax_API

1. Please refer to readme.pdf file to better understand the app.

2. Notes (known limitations):

  2.1. Due to lack of support from API service side, the app works slower for maximum number of records available (5000+).
  Developing a paging mechanism from client side was not defined as a part of the task, and due to timeframe limitation it wasn't developed.
  For better performace, the app is currently set up to work with 1000 records only (can easily be changed in app.js dedicated predefined constant).
  
  2.2. Some of the currencies have no available rates, and therefore won't show any data in graph (Live Reports tab).
       This is a bug in API service side.
