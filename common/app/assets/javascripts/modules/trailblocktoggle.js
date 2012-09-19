define(['common', 'bonzo', 'bean'], function(common, bonzo, bean) {

    var TrailblockToggle = function () {

        var view = {

            showToggleLinks: function (selector) {
                var toggles = common.$g(selector).each(function (toggle) {
                    
                    bonzo(toggle).removeClass('initially-off'); // show the nav links

                    bean.add(toggle, 'click', function (e) {
                        view.toggleTrailblock(this);
                    });
                });
            },

            toggleTrailblock: function (trigger, manualTrigger) {
                var idPrefix = "front-trailblock-";
                
                if (manualTrigger) {
                    trigger = document.getElementById('js-trigger-' + manualTrigger);
                }

                var trailblockId = trigger.getAttribute('data-block-name'),
                    trailblock;
                trailblock = idPrefix;

                if (trailblockId !== "top-stories") {
                    trailblock += trailblockId;
                }

                trailblock = document.getElementById(trailblock);
                bonzo(trailblock).toggleClass('rolled-out rolled-up')

                var trigText = trigger.innerText;          
                var hideTrailblock = (trigText === "Hide") ? true : false;
                trigger.innerText = (hideTrailblock) ? "Show" : "Hide";
                
                if (!manualTrigger) { // don't add it to prefs since we're reading from them
                    model.logPreference(hideTrailblock, trailblockId, 'uk'); // todo: proper editions
                }
            },

            // todo: editionalise
            renderUserPreference: function () {
                // bit of duplication here from function below
                if (window.localStorage) { 
                    var existingPrefs = guardian.userPrefs.get("front-trailblocks");

                    if (existingPrefs) {
                        var sectionArray = existingPrefs.split(',');
                        for (var i in sectionArray) {
                            var item = sectionArray[i];
                            view.toggleTrailblock(null, item);
                        }
                    }
                }
            }

        };

        var model = {

            // todo: editionalise
            logPreference: function (shouldHideSection, section, edition) {
                
                if (window.localStorage) {
                    var existingPrefs = guardian.userPrefs.get("front-trailblocks");
                    
                    if (existingPrefs) {

                        // see if it already exists
                        var sectionArray = existingPrefs.split(',');
                        for (var i in sectionArray) {
                            var item = sectionArray[i];
                            if (item === section) {
                                if (!shouldHideSection) {
                                    sectionArray.splice(i, 1); // remove it from list
                                }
                            }
                        }

                        if (shouldHideSection) {
                            sectionArray.push(section);
                        }

                        var newPrefs = sectionArray.join(',');
                        guardian.userPrefs.set("front-trailblocks", newPrefs);
                    
                    // need to create it instead
                    } else {
                        guardian.userPrefs.set("front-trailblocks", section);
                    }

                }
                
            }

        };

        this.go = function (selector) {

            if (!selector) {
                selector = '.js-toggle-trailblock';
            }
        
            view.showToggleLinks(selector);
            view.renderUserPreference();

        };

    };

    return TrailblockToggle;

});