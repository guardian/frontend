define([
], function (
) {
    browserCheck = new Promise(function (resolve) {
        var db;
        var on = function () {
            resolve(true);
        };
        var off = function () {
             resolve(false);
        };
        var tryLocalStorage = function () {
            try {
                localStorage.length ? off() : (localStorage.x = 1, localStorage.removeItem('x'), off());
            } catch (e) {
                on();
            }
        };

        // Blink
        window.webkitRequestFileSystem ?
            window.webkitRequestFileSystem(window.TEMPORARY, 1, off, on)

        // Firefox
        : 'MozAppearance' in document.documentElement.style ?
            (db = indexedDB.open('test'), db.onerror = on, db.onsuccess = off)

        // Safari
        : /constructor/i.test(window.HTMLElement) ? tryLocalStorage()

        // IE10+ and edge
        : !window.indexedDB && (window.PointerEvent || window.MSPointerEvent) ? on()

        // Rest
        : off();
    });

    return browserCheck;
});
