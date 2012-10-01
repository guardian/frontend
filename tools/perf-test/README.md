
Generate a list of articles from an httpd log,

```
ruby bin/classify-httpd-log.rb logs/guardian-access_log.20120622.guweb01 | grep ART > logs/articles
```

Generate a list of Content API calls from the above log.

Articles and related need the above log files fed from STDIN,

```
ruby bin/generate-urls.rb article < logs/articles > logs/articles.test-mq-elb
ruby bin/generate-urls.rb related < logs/articles > logs/articles.test-mq-elb.related
```

Top stories and most popular are static API calls so don't need the log file,


```
ruby bin/generate-urls.rb top > logs/articles.test-mq-elb.top
ruby bin/generate-urls.rb popular > logs/articles.test-mq-elb.popular
```

Notes
-----

The Load Balancer is at :-

    http://test-mq-elb.content.guardianapis.com/api/search.json

You can see the graphs for this system at :-

    http://graphite.guprod.gnl/dashboard/dashboards-dev/content-api-mq.php?time=2h&env=TEST

Please drop us an email (to content.platforms@guardian.co.uk) when you are going to be perf testing, just in
case we need to perf test ourselves, and so we don't redeploy in the middle of it.  I don't need specific times,
just days or half days so we know when it's in use.


