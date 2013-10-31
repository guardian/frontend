/*
 Module: analysis.js
 Description: Analysis of history 
 */
define([], function() {

    var Analysis = function (config) {
        this.history = config.history;
        return this;
    }

    Analysis.prototype.DEFAULTS = {
        // sessionLength 
    }

    // in seconds
    Analysis.prototype.timeSinceLastVisit = {
        (this.history[0].date - new DateTiime()) / 1000;
    }
    
    Analysis.prototype.isNewSession = {
        (this.timeSinceLastVisit() > 1800); // 30 minutes
    }
    
    Analysis.prototype.frequentedTags() = {
        var tags = {}
        this.history.map(function(item){
            item.tags.forEach(function (tag) {
                tags[tag]++;
            })
        })
    }

    return Analysis;

});
