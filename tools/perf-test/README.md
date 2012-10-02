
httpd logs
----------

Generate a list of articles from an httpd log,

```
ruby bin/classify-httpd-log.rb logs/guardian-access_log.20120622.guweb01 | grep ART > logs/articles
```

Generating perf test URLs
-------------------------

API
---

Firstly, you can generate a list of Content API calls from the above log,

```
ruby bin/generate-urls.rb article api < logs/articles > logs/articles.test-mq-elb
ruby bin/generate-urls.rb related api < logs/articles > logs/articles.test-mq-elb.related
```

Top stories and most popular are static API calls so don't need the log file,


```
ruby bin/generate-urls.rb top > logs/articles.test-mq-elb.top
ruby bin/generate-urls.rb popular > logs/articles.test-mq-elb.popular
```

WWW
---

Using the _www_ switch, you can serialise the resources as calls to the public facing frontend stack, 

```
ruby bin/generate-urls.rb article www < logs/articles > logs/articles.test-mq-elb.www
```

Notes
-----

 - Perf test ELB is at [http://test-mq-elb.content.guardianapis.com/api/search.json]
 - You can see the graphs for this system at [http://graphite.guprod.gnl/dashboard/dashboards-dev/content-api-mq.php?time=2h&env=TEST]
 - Support <content.platforms@guardian.co.uk>

