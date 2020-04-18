
-- REDDIT ONE DAY

-- You can compose your queries on bigquery using reddit dataset,
-- which is available at, https://bigquery.cloud.google.com/dataset/fh-bigquery:reddit_comments

-- Retrieve comments in 20190627
-- Will result 4,913,934 rows 
-- with "timestamp, author, sequence number, index and comment" columns

-- The query should be run as Standard SQL

-- You can download this as JSON on bigquery, 
--	(If the result is too big, you can save the results to a table and download in part by filtering, using the index column )

-- 1. Get the data for 27 June 2019

SELECT created_utc-1561593600 as ts, author, body
FROM `fh-bigquery.reddit_comments.2019_06`
where created_utc > 1561593599 and created_utc < 1561680000
ORDER BY created_utc


-- 3. Save data to a table say 'trollthrottle.bq.reddit'.
-- 4. Run the following


select ts, author, ROW_NUMBER() OVER (PARTITION BY author ORDER BY ts) as seq, 
		ROW_NUMBER() OVER(ORDER BY ts, author) AS index, body 
      FROM `trollthrottle.bq.reddit`  
      order by ts, author, seq, index

-- 5. The resulting table is the data, you can store it to a google buckle and download as json/gzip
-- 6. Save as data_file into 'data/reddit/raw/data_file'



-- 7. Determine NEW USERS

select DISTINCT author from `trollthrottle.bq.reddit`  where author NOT IN 
(
select DISTINCT author from `fh-bigquery.reddit_comments.2005` 
UNION ALL 
select DISTINCT author from `fh-bigquery.reddit_comments.2006` 
UNION ALL
select DISTINCT author from `fh-bigquery.reddit_comments.2007` 
UNION ALL 
select DISTINCT author from `fh-bigquery.reddit_comments.2008` 
UNION ALL
select DISTINCT author from `fh-bigquery.reddit_comments.2009` 
UNION ALL 
select DISTINCT author from `fh-bigquery.reddit_comments.2010` 
UNION ALL
select DISTINCT author from `fh-bigquery.reddit_comments.2011` 
UNION ALL 
select DISTINCT author from `fh-bigquery.reddit_comments.2012` 
UNION ALL
select DISTINCT author from `fh-bigquery.reddit_comments.2013` 
UNION ALL 
select DISTINCT author from `fh-bigquery.reddit_comments.2014` 
UNION ALL
select DISTINCT author from `fh-bigquery.reddit_comments.2015_01` 
UNION ALL 
select DISTINCT author from `fh-bigquery.reddit_comments.2015_02` 
UNION ALL
select DISTINCT author from `fh-bigquery.reddit_comments.2015_03` 
UNION ALL 
select DISTINCT author from `fh-bigquery.reddit_comments.2015_04` 
UNION ALL
select DISTINCT author from `fh-bigquery.reddit_comments.2015_05` 
UNION ALL 
select DISTINCT author from `fh-bigquery.reddit_comments.2015_06` 
UNION ALL
select DISTINCT author from `fh-bigquery.reddit_comments.2015_07` 
UNION ALL 
select DISTINCT author from `fh-bigquery.reddit_comments.2015_08` 
UNION ALL
select DISTINCT author from `fh-bigquery.reddit_comments.2015_09` 
UNION ALL 
select DISTINCT author from `fh-bigquery.reddit_comments.2015_10` 
UNION ALL
select DISTINCT author from `fh-bigquery.reddit_comments.2015_11` 
UNION ALL 
select DISTINCT author from `fh-bigquery.reddit_comments.2015_12` 
UNION ALL
select DISTINCT author from `fh-bigquery.reddit_comments.2016_01` 
UNION ALL 
select DISTINCT author from `fh-bigquery.reddit_comments.2016_02` 
UNION ALL
select DISTINCT author from `fh-bigquery.reddit_comments.2016_03` 
UNION ALL 
select DISTINCT author from `fh-bigquery.reddit_comments.2016_04` 
UNION ALL
select DISTINCT author from `fh-bigquery.reddit_comments.2016_05` 
UNION ALL 
select DISTINCT author from `fh-bigquery.reddit_comments.2016_06` 
UNION ALL
select DISTINCT author from `fh-bigquery.reddit_comments.2016_07` 
UNION ALL 
select DISTINCT author from `fh-bigquery.reddit_comments.2016_08` 
UNION ALL
select DISTINCT author from `fh-bigquery.reddit_comments.2016_09` 
UNION ALL
select DISTINCT author from `fh-bigquery.reddit_comments.2016_10` 
UNION ALL
select DISTINCT author from `fh-bigquery.reddit_comments.2016_11` 
UNION ALL 
select DISTINCT author from `fh-bigquery.reddit_comments.2016_12` 
UNION ALL
select DISTINCT author from `fh-bigquery.reddit_comments.2017_01` 
UNION ALL 
select DISTINCT author from `fh-bigquery.reddit_comments.2017_02` 
UNION ALL
select DISTINCT author from `fh-bigquery.reddit_comments.2017_03` 
UNION ALL 
select DISTINCT author from `fh-bigquery.reddit_comments.2017_04` 
UNION ALL
select DISTINCT author from `fh-bigquery.reddit_comments.2017_05` 
UNION ALL 
select DISTINCT author from `fh-bigquery.reddit_comments.2017_06` 
UNION ALL
select DISTINCT author from `fh-bigquery.reddit_comments.2017_07` 
UNION ALL 
select DISTINCT author from `fh-bigquery.reddit_comments.2017_08` 
UNION ALL
select DISTINCT author from `fh-bigquery.reddit_comments.2017_09` 
UNION ALL 
select DISTINCT author from `fh-bigquery.reddit_comments.2017_10` 
UNION ALL
select DISTINCT author from `fh-bigquery.reddit_comments.2017_11` 
UNION ALL 
select DISTINCT author from `fh-bigquery.reddit_comments.2017_12` 
UNION ALL
select DISTINCT author from `fh-bigquery.reddit_comments.2018_01` 
UNION ALL 
select DISTINCT author from `fh-bigquery.reddit_comments.2018_02` 
UNION ALL
select DISTINCT author from `fh-bigquery.reddit_comments.2018_03` 
UNION ALL 
select DISTINCT author from `fh-bigquery.reddit_comments.2018_04` 
UNION ALL
select DISTINCT author from `fh-bigquery.reddit_comments.2018_05` 
UNION ALL 
select DISTINCT author from `fh-bigquery.reddit_comments.2018_06` 
UNION ALL
select DISTINCT author from `fh-bigquery.reddit_comments.2018_07` 
UNION ALL 
select DISTINCT author from `fh-bigquery.reddit_comments.2018_08` 
UNION ALL
select DISTINCT author from `fh-bigquery.reddit_comments.2018_09` 
UNION ALL 
select DISTINCT author from `fh-bigquery.reddit_comments.2018_10` 
UNION ALL
select DISTINCT author from `fh-bigquery.reddit_comments.2018_11` 
UNION ALL 
select DISTINCT author from `fh-bigquery.reddit_comments.2018_12` 
UNION ALL
select DISTINCT author from `fh-bigquery.reddit_comments.2019_01` 
UNION ALL 
select DISTINCT author from `fh-bigquery.reddit_comments.2019_02` 
UNION ALL
select DISTINCT author from `fh-bigquery.reddit_comments.2019_03` 
UNION ALL 
select DISTINCT author from `fh-bigquery.reddit_comments.2019_04` 
UNION ALL
select DISTINCT author from `fh-bigquery.reddit_comments.2019_05` 
UNION ALL 
select DISTINCT author from `fh-bigquery.reddit_comments.2019_06` where created_utc < 1561593599 
)
--8. Download NEW USERS as new_users.json file into 'data/reddit/raw/new_users.json'
