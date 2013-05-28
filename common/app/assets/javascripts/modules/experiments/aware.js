define([
    'common',
    'modules/storage'
], function (
    common,
    store) {

    var storagePrefix = 'gu.aware',
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
        store.set(storagePrefix, data);
    };
    
    // JSON interface to the local storage get()
    var get = function () {
        return (store.get(storagePrefix)) ? store.get(storagePrefix) : {};
    };
    
    var remove = function () {
        store.remove(storagePrefix);
        data = {};
    };
    
    // returns the start of a 24hr cycle, lets say 11pm the previous day
    var startOfToday = function () {
        var y = new Date();
        y.setDate(y.getDate() - 1);
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
    
    var lastVisit = function () {
        var data = get();
        return (data[keys.last]) ? (new Date() - new Date(data[keys.last])) / 1000 / 60 : -1;
    };

    var firstVisitToday = function () { // if the last visit logged was before 11pm the previous evening
        var data = get();
        return (data[keys.last]) ? (new Date(data[keys.last]) < epoch) : false;
    };
    
    var firstVisitInSession = function () {
        var last = lastVisit();
        return (last === -1 || last > 30); // a session is 30 minutes
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

        if (firstVisitToday()) {
            resetToday();
        } else {
            incrementVisitsToday();
        }
      
        incrementVisits();
        
        if (config.section) {
            incrementVisitsToSection(config.section);
        }

    };

    init();

    return {
        init: init,
        visits: visits,
        logVisit: logVisit,
        firstVisit: firstVisit,
        firstVisitToday: firstVisitToday,
        visitsToday: visitsToday,
        visitsInSession: visitsInSession,
        lastVisit: lastVisit,
        sessionEntry: sessionEntry,
        visitsBySection: visitsBySection,
        get: get,
        remove: remove
        };


    });
