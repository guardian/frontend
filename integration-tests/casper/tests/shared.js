casper = require('casper').create(),
host = casper.cli.get('host') || "http://localhost:9000/";
casper.echo("Host is " + host);
