define([
    'common',
    'modules/userPrefs'
], function (
    common,
    userPrefs) {

    var storagePrefix = 'aware',
        data = {},
        now,
        epoch,
        keys = {
            total:   'total',
            last:    'last',
            today:   'today',
            path:    'path',
            section: 'section.'
        };

    var init = function () {
        data = {};
        epoch = startOfToday();
    };
    
    // JSON interface to the local storage set()
    var set = function (data) {
        userPrefs.set(storagePrefix, data);
    };
    
    // JSON interface to the local storage get()
    var get = function () {
        return (userPrefs.get(storagePrefix)) ? userPrefs.get(storagePrefix) : {};
    };
    
    var remove = function () {
        userPrefs.remove(storagePrefix);
    };
    
    // returns the start of a 24hr cycle, lets say 11pm the previous day
    var startOfToday = function () {
        var y  = new Date(new Date() - 1);
        y.setHours(23);
        y.setMinutes(0);
        y.setSeconds(0);
        return y;
    };

    var visits = function () {
        var data = get(),
            v = parseInt(data[keys.total], 0);
        return (isNaN(v)) ? 0 : v;
    };
  
    var visitsBySection = function (section) {
        var data = get(),
            v = parseInt(data[keys.section + section], 0);
        return (isNaN(v)) ? 0 : v;
    };

    var visitsToday = function () {
        var data = get(),
            visits = parseInt(data[keys.today], 0);
        var v = parseInt(data[keys.section + section], 10);
        return (isNaN(v)) ? 0 : v;
    };
  
    var firstVisit = function () {
        return (visits() === 0);
    };
    
    // hours ago
    var lastVisit = function () {
        var data = get();
        console.log(data[keys.last]);
        return (new Date() - new Date(data[keys.last])) / 1000 / 60 / 60;
    };

    var firstVisitToday = function () {
        return (((new Date() - epoch) / 1000 / 60 / 60) < 24);
    };
    
    var path = function () {
        if (!data[keys.path]) {
            data[keys.path] = []
        }
        return data[keys.path]
    };
   
    var incrementPath = function (p) {
        var data = get(),
            hoursSinceLastVisit = lastVisit();
        console.log(hoursSinceLastVisit, path());
        if (hoursSinceLastVisit < 0) {
            data[keys.path].push(p);
        } else {
            data[keys.path] = [p]
        } 
        set(data);
    };

    var incrementVisits = function () {
        data[keys.total] = visits() + 1;
        data[keys.last] = new Date();
        set(data);
    };

    var incrementVisitsToday = function () {
        data[keys.today] = visitsToday() + 1;
        set(data);
    };

    var resetToday = function () {
        data[keys.today] = 1;
        set(data);
    };

    var incrementVisitsToSection = function (name) {
        data[keys.section + name] = visitsBySection(name) + 1;
        set(data);
    };

    //
    var logVisit = function (config) {
       
        incrementPath(config.pageId)
        
        incrementVisits();

        if (config.section) {
            incrementVisitsToSection(config.section);
        }
        
        if (firstVisitToday()) {
            incrementVisitsToday();
        } else {
            resetToday();
        }
     

    };

    return {
        init: init,
        visits: visits,
        logVisit: logVisit,
        firstVisit: firstVisit,
        visitsToday: visitsToday,
        lastVisit: lastVisit,
        visitsBySection: visitsBySection,
        get: get,
        path: path,
        remove: remove
        };

    });
