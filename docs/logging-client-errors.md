
# Logging client-side information.

It is useful to be able to log random data back on to the server to help diagnose problems.

The client-side diagnostics box serves this purpose.

The quickest way to use is it for your code to depend on the Errors module,

```
define([
    'common',
    'modules/errors'
], function(
    common,
    Errors
) { ... } 
```

And then use the `new Errors().log(...)` interface to log a message, 


```
// Only log every 1/1000th request.
if ((Math.random() < 0.001)) {
    var msg = document.body.className + '~' + s.prop51 + '~' + s.eVar51 + '~' + localStorage.getItem('gu.ab.participations'),
        e = new Errors({ window: window, isDev: config.page.isDev }).log(msg, 'modules/analytics/omniture', 0, false);
}
```

Once your code is in production you can ssh on to the diagnostics box and tail the Nginx logs.
