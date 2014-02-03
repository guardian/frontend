/* global _: true */
define([], function() {
    return function (msg) {
        if (msg) { window.alert("Please contact support. Error: " + msg); }
        window.location.href = '/logout';
    };
});