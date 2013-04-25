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
            section: 'section.'
        };

    var init = function () {
        epoch = startOfToday();
    };
    
    // JSON interface to the local storage set()
    var set = function (data) {
        userPrefs.set(storagePrefix, JSON.stringify(data));
    };
    
    // JSON interface to the local storage get()
    var get = function () {
        return (userPrefs.get(storagePrefix)) ? JSON.parse(userPrefs.get(storagePrefix)) : {};
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
        var v = parseInt(data[keys.total], 0);
        return (isNaN(v)) ? 0 : v;
    };
  
    var visitsBySection = function (section) {
        var v = parseInt(data[keys.section + section], 10);
        return (isNaN(v)) ? 0 : v;
    };

    var visitsToday = function (today) {
        var visits = parseInt(data[keys.today], 10);
        return (isNaN(visits)) ? 0 : visits;
    };
  
    var firstVisit = function () {
        return (visits() === 0);
    };
    
    // seconds ago
    var lastVisit = function (now) {
        return (now - new Date(data[keys.last])) / 1000 / 60 / 60;
    };

    var firstVisitToday = function () {
        return (((new Date() - epoch) / 1000 / 60 / 60) < 24);
    };
    
    var incrementVisits = function () {
        data[keys.total] = visits() + 1;
        data[keys.last] = new Date();
    };

    var incrementVisitsToday = function () {
        data[keys.today] = visitsToday() + 1;
    };

    var resetToday = function () {
        data[keys.today] = 1;
    };

    var incrementVisitsToSection = function (name) {
        data[keys.section + name] = visitsBySection(name) + 1;
    };

    //
    var logVisit = function (section) {
        
        data = get();
        data[keys.last] =  new Date();
        
        incrementVisits();

        if (section) {
            incrementVisitsToSection(section);
        }
        
        if (firstVisitToday()) {
            incrementVisitsToday();
        } else {
            resetToday();
        }
        
        set(data);
    };

    return {
        init: init,
        visits: visits,
        logVisit: logVisit,
        firstVisit: firstVisit,
        visitsToday: visitsToday,
        lastVisit: lastVisit,
        visitsBySection: visitsBySection
        };
    });
