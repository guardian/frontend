define([
    'common',
    'modules/userPrefs'
], function (
    common,
    userPrefs) {

    var storagePrefix = 'aware',
        now,
        epoch,
        keys = {
            total:   storagePrefix + '.total',
            last:    storagePrefix + '.last',
            today:   storagePrefix + '.today',
            section: storagePrefix + '.section.'

        };

    var init = function () {
        userPrefs.set(keys.last, new Date());
        epoch = startOfToday();
    }

    // returns the start of a 24hr cycle, lets say 11pm the previous day
    var startOfToday = function () {
        var y  = new Date(new Date() - 1)
        y.setHours(23);
        y.setMinutes(0);
        y.setSeconds(0);
        return y;
    }

    var visits = function (section) {
        var v = parseInt(userPrefs.get(keys.total));
        return (isNaN(v)) ? 0 : v
    }
  
    var visitsBySection = function (section) {
        var v = parseInt(userPrefs.get(keys.section + section));
        return (isNaN(v)) ? 0 : v
    }

    var visitsToday = function (today) {
        var visits = parseInt(userPrefs.get(keys.today));
        return (isNaN(visits)) ? 0 : visits 
    }
  
    var firstTime = function () {
        return (visits() === 0)
    }
    
    // seconds ago
    var lastVisit = function (now) {
        return (now - new Date(userPrefs.get(keys.last))) / 1000 / 60 / 60 
    }

    var firstVisitToday = function () {
        return (((new Date() - epoch) / 1000 / 60 / 60) < 24)
    }
    
    var incrementVisits = function () {
        userPrefs.set(keys.total, visits() + 1)
        userPrefs.set(keys.last, new Date());
    }

    var incrementVisitsToday = function () {
        userPrefs.set(keys.today, visitsToday() + 1)
    }

    var resetToday = function () {
        userPrefs.set(keys.today, 1)
    }

    var incrementVisitsToSection = function (name) {
        userPrefs.set(keys.section + name, visitsBySection(name) + 1);
    }

    //
    var logVisit = function (section) {
        incrementVisits()
        if (section) {
            incrementVisitsToSection(section)
        }
        (firstVisitToday()) ? incrementVisitsToday() : resetToday()
    }

    return {
        init: init,
        visits: visits, 
        logVisit: logVisit,
        firstTime: firstTime,
        visitsToday: visitsToday,
        lastVisit: lastVisit,
        visitsBySection: visitsBySection
        }
    });
