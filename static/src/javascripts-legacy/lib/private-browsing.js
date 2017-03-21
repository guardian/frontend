define([
    'Promise'
], function (
    Promise
) {
    var browserCheck = new Promise(function (resolve) {
        var on = function () {
            resolve(true);
        };
        var off = function () {
             resolve(false);
        };
        var tryLocalStorage = function() {
            try {
                localStorage.length ? off() : (localStorage.x = 1, localStorage.removeItem('x'), off());
            } catch (e) {
                on();
            }
        };

        var tryIndexedDB = function() {
            var db;

            try {
                db = indexedDB.open('test');
                db.onerror = on;
                db.onsuccess = off;
            } catch(err) {
                on();
            }
        };

        // Blink
        if (window.webkitRequestFileSystem) {
            window.webkitRequestFileSystem(window.TEMPORARY, 1, off, on);

        // Firefox
        } else if ('MozAppearance' in document.documentElement.style) {
            tryIndexedDB();

        // Safari
        } else if (/constructor/i.test(window.HTMLElement)) {
            tryLocalStorage();

        // IE10+ and edge
        } else if (!window.indexedDB && (window.PointerEvent || window.MSPointerEvent)) {
            on();

        // Rest
        } else {
            off();
        }
    });

    return browserCheck;
});
