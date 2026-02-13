# Accessing HTTP access logs for your localhost

Occasionally it's useful to look at the incoming access logs.

[Play](http://www.playframework.org/documentation) doesn't contain anything that allows a traditional
httpd log, but it's simple to stick a web server in front of it and proxy requests to your application.

Here's how I did it.

Install _nginx_ - a web server with proxypass capabilities,

    brew install nginx

Tell it to proxy to your play application,

    -- /usr/local/etc/nginx/nginx.conf

    ...

    server {
        listen       8182;   <--- the nginx port number
        server_name  localhost;

        access_log  logs/host.access.log;

        location / {
            proxy_set_header X-Real-IP  $remote_addr;
            proxy_set_header X-Forwarded-For $remote_addr;
            proxy_set_header Host $host;
            proxy_pass http://127.0.0.1:9002;   <--- your play application
        }
    }

    ...

Run the nginx server (your nginx binary might be somewhere else),

    /usr/local/Cellar/nginx/1.2.1/sbin/nginx -s reload

Then fire up an _article_ server on the port specified,

    sbt
    > project article
    > run 9002

Then make a request to nginx,

    open http://localhost:8182/sport/2012/jun/12/london-2012-olympic-opening-ceremony

And poke around your log file (your log file might be somewhere else),

    tail -f /usr/local/Cellar/nginx/1.2.1/logs/host.access.log

