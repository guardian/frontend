/* global document */
'use strict';

/**
 *
 * Discussion feature tests 
 *
 **/
var casper = require('casper').create(),
    host = casper.cli.get('host') || "http://localhost:9000";

casper.start(host + '/admin');

casper.then(function() {
    this.click('#login-button');
});

casper.waitFor(function check() {
    return (this.getCurrentUrl().indexOf('accounts.google.com/ServiceLogin') > -1);
    //return (this.getCurrentUrl().indexOf('/openIDCallback') > -1);
});

casper.then(function() {
    this.fill('#gaia_loginform', {
        'Email': 'test.automation@gutest.com',
        'Passwd': 'Setup001'    
    }, true);
})

casper.waitFor(
    function check() {
        return (this.getCurrentUrl().indexOf('/admin') > -1);
    }, 
    function then() { }, 
    function timeout() {
        casper.viewport(1024, 768);
        casper.captureSelector('body.png', 'body');
        this.warn(this.getCurrentUrl());
        var foo = this.getCurrentUrl().replace(/^https/, 'http')
        this.warn(foo);
        // try manually redirecting
        this.open(foo).then(function() {
            this.warn(this.getCurrentUrl());
        });
    }
);

casper.waitFor(
    function check() {
        return (this.getCurrentUrl().indexOf('/admin') > -1);
    }
);

casper.run(function() {
    this.test.renderResults(true, 0, this.cli.get('save') || false);
});

