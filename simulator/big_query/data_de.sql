-- 0. [For information], to receive the whole starting and ending timestamps of a day in a month. 


-- IGNORE this query for simulation data!

SELECT
    DATE(TIMESTAMP_SECONDS(r.ts_start)) AS date, r.ts_start as ts_start, r.ts_start+86400 as ts_end 
  FROM ((
      WITH shifts AS (
        SELECT
          [STRUCT(" 00:00:00 UTC" AS hrs,
            GENERATE_DATE_ARRAY('2019-06-01', '2019-06-30', INTERVAL 1 DAY) AS dt_range) ] AS full_timestamps )
      SELECT
        UNIX_SECONDS(CAST(CONCAT( CAST(dt AS STRING), CAST(hrs AS STRING)) AS TIMESTAMP)) AS ts_start,
        UNIX_SECONDS(CAST(CONCAT( CAST(dt AS STRING), CAST(hrs AS STRING)) AS TIMESTAMP)) + 86400 AS ts_end
      FROM
        shifts, shifts.full_timestamps
      LEFT JOIN
        full_timestamps.dt_range AS dt)) r
  GROUP BY r.ts_start


  -- 1. To receive the comments in order for subreddt 'de'

  SELECT (case when (created_utc - 1561852800) < 86400 AND (created_utc - 1561852800)>=0 then created_utc - 1561852800
when (created_utc - 1561766400) < 86400 AND (created_utc - 1561766400)>=0 then created_utc - 1561766400
when (created_utc - 1561680000) < 86400 AND (created_utc - 1561680000)>=0 then created_utc - 1561680000
when (created_utc - 1561593600) < 86400 AND (created_utc - 1561593600)>=0 then created_utc - 1561593600
when (created_utc - 1561507200) < 86400 AND (created_utc - 1561507200)>=0 then created_utc - 1561507200
when (created_utc - 1561420800) < 86400 AND (created_utc - 1561420800)>=0 then created_utc - 1561420800
when (created_utc - 1561334400) < 86400 AND (created_utc - 1561334400)>=0 then created_utc - 1561334400
when (created_utc - 1561248000) < 86400 AND (created_utc - 1561248000)>=0 then created_utc - 1561248000
when (created_utc - 1561161600) < 86400 AND (created_utc - 1561161600)>=0 then created_utc - 1561161600
when (created_utc - 1561075200) < 86400 AND (created_utc - 1561075200)>=0 then created_utc - 1561075200
when (created_utc - 1560988800) < 86400 AND (created_utc - 1560988800)>=0 then created_utc - 1560988800
when (created_utc - 1560902400) < 86400 AND (created_utc - 1560902400)>=0 then created_utc - 1560902400
when (created_utc - 1560816000) < 86400 AND (created_utc - 1560816000)>=0 then created_utc - 1560816000
when (created_utc - 1560729600) < 86400 AND (created_utc - 1560729600)>=0 then created_utc - 1560729600
when (created_utc - 1560643200) < 86400 AND (created_utc - 1560643200)>=0 then created_utc - 1560643200
when (created_utc - 1560556800) < 86400 AND (created_utc - 1560556800)>=0 then created_utc - 1560556800
when (created_utc - 1560470400) < 86400 AND (created_utc - 1560470400)>=0 then created_utc - 1560470400
when (created_utc - 1560384000) < 86400 AND (created_utc - 1560384000)>=0 then created_utc - 1560384000
when (created_utc - 1560297600) < 86400 AND (created_utc - 1560297600)>=0 then created_utc - 1560297600
when (created_utc - 1560211200) < 86400 AND (created_utc - 1560211200)>=0 then created_utc - 1560211200
when (created_utc - 1560124800) < 86400 AND (created_utc - 1560124800)>=0 then created_utc - 1560124800
when (created_utc - 1560038400) < 86400 AND (created_utc - 1560038400)>=0 then created_utc - 1560038400
when (created_utc - 1559952000) < 86400 AND (created_utc - 1559952000)>=0 then created_utc - 1559952000
when (created_utc - 1559865600) < 86400 AND (created_utc - 1559865600)>=0 then created_utc - 1559865600
when (created_utc - 1559779200) < 86400 AND (created_utc - 1559779200)>=0 then created_utc - 1559779200
when (created_utc - 1559692800) < 86400 AND (created_utc - 1559692800)>=0 then created_utc - 1559692800
when (created_utc - 1559606400) < 86400 AND (created_utc - 1559606400)>=0 then created_utc - 1559606400
when (created_utc - 1559520000) < 86400 AND (created_utc - 1559520000)>=0 then created_utc - 1559520000
when (created_utc - 1559433600) < 86400 AND (created_utc - 1559433600)>=0 then created_utc - 1559433600
when (created_utc - 1559347200) < 86400 AND (created_utc - 1559347200)>=0 then created_utc - 1559347200
END) as ts, author, body
      FROM `fh-bigquery.reddit_comments.2019_06` 
      where subreddit='de'
      order by ts

-- 2. Save to a table, say name 'trollthrottle.bq.de_1906'
-- 3. Query the table:


select ts, author, ROW_NUMBER() OVER (PARTITION BY author ORDER BY ts) as seq, body 
      FROM `trollthrottle.bq.de_1906`  
      order by ts


-- 4. The result is the data, you can store it to a google buckle and download as JSON/gzip
-- 5. Save as data_file into 'data/de/raw/data_file'




-- 6. Determine NEW USERS

select DISTINCT author from `trollthrottle.bq.de_1906`  where author NOT IN 
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
)
-- 7. Download NEW USERS as new_users.json file into 'data/de/raw/new_users.json'
