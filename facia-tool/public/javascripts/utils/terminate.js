define([], function() {
    return function (msg, redirectTo) {
        if (msg) { window.alert(msg); }
        window.location.href = redirectTo ? redirectTo : '/logout';
    };
});
