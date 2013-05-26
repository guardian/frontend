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
            section: 'section.',
            session: 'session',
            entry:   'entry'
        };

    var init = function () {
        data = get();
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
        data = {};
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
            v = parseInt(data[keys.total], 10);
        return (isNaN(v)) ? 0 : v;
    };
  
    var visitsBySection = function (section) {
        var data = get(),
            visits = parseInt(data[keys.section + section], 10);
        return (isNaN(visits)) ? 0 : visits;
    };

    var visitsToday = function () {
        var data = get(),
            visits = parseInt(data[keys.today], 10);
        return (isNaN(visits)) ? 0 : visits;
    };
    
    var sessionEntry = function () {
        var data = get();
        return data[keys.entry];
    };
    
    var visitsInSession = function () {
        var data = get(),
            visits = parseInt(data[keys.session], 10);
        return (isNaN(visits)) ? 0 : visits;
    };
  
    var firstVisit = function () {
        return (visits() === 0);
    };
    
    // hours ago
    var lastVisit = function () {
        var data = get();
        return (data[keys.last]) ? (new Date() - new Date(data[keys.last])) / 1000 / 60 : 100000000;
    };

    var firstVisitToday = function () {
        return (((new Date() - epoch) / 1000 / 60 / 60) < 24);
    };
    
    var firstVisitInSession = function () {
        return (lastVisit() > 30); // a session is 30 minutes
    };
    
    var incrementVisits = function () {
        var data = get();
        data[keys.total] = visits() + 1;
        data[keys.last] = new Date();
        set(data);
    };

    var incrementVisitsToday = function () {
        var data = get();
        data[keys.today] = visitsToday() + 1;
        set(data);
    };
    
    var incrementVisitsInSession = function () {
        var data = get();
        data[keys.session] = visitsInSession() + 1;
        set(data);
    };

    var resetToday = function () {
        var data = get();
        data[keys.today] = 1;
        set(data);
    };
    
    var resetSession = function (contentType) {
        var data = get();
        data[keys.session] = 1;
        set(data);
    };
    
    var logEntryPage = function (contentType) {
        var data = get();
        data[keys.entry] = (contentType === 'Network Front' || contentType === 'Section') ? 'front' : 'article';
        set(data);
    };

    var incrementVisitsToSection = function (name) {
        var data = get();
        data[keys.section + name] = visitsBySection(name) + 1;
        set(data);
    };

    //
    var logVisit = function (config) {
        
        if (firstVisitInSession()) {
            resetSession();
            logEntryPage(config.contentType);
        } else {
            incrementVisitsInSession();
        }
      
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

    init();

    return {
        init: init,
        visits: visits,
        logVisit: logVisit,
        firstVisit: firstVisit,
        visitsToday: visitsToday,
        visitsInSession: visitsInSession,
        lastVisit: lastVisit,
        sessionEntry: sessionEntry,
        visitsBySection: visitsBySection,
        get: get,
        remove: remove
        };


    });
