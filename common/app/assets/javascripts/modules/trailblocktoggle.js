define([
    'common',
    'modules/userPrefs',
    'bonzo',
    'bean'
], function(
    common,
    userPrefs,
    bonzo,
    bean
) {

    var TrailblockToggle = function () {

        var options = {
            'toggleSelectorClass': '.js-toggle-trailblock',
            'edition' : '',
            'prefName': 'front-trailblocks-'
        };

        var view = {

            showToggleLinks: function () {

                var toggles = common.$g(options.toggleSelectorClass).each(function (toggle) {

                    bean.add(toggle, 'click', function (e) {
                        view.toggleTrailblock(this);
                    });
                });
            },

            toggleTrailblock: function (trigger, manualTrigger) {

                var idPrefix = "front-trailblock-";
                var classesToToggle = 'rolled-out rolled-up';

                if (manualTrigger) {
                    trigger = document.getElementById('js-trigger-' + manualTrigger);
                }

                // convert trigger to bonzo object
                trigger = bonzo(trigger);

                var trailblockId = trigger.attr('data-block-name'),
                    trailblock;

                trailblock = idPrefix;
                trailblock += trailblockId;

                trailblock = document.getElementById(trailblock);
                bonzo(trailblock).toggleClass(classesToToggle);

                var text = trigger.text();
                var hideTrailblock = (text === "Hide") ? "Show" : "Hide";
                trigger.text(hideTrailblock);
                //This is backwards as executes before omniture call
                trigger.attr('data-link-name', (text === "Hide") ? "Hide" : "Show");

                if (!manualTrigger) { // don't add it to prefs since we're reading from them
                    var shouldHideSection = true;
                    if (hideTrailblock === "Hide") {
                        shouldHideSection = false;
                    }
                    model.logPreference(shouldHideSection, trailblockId);
                }
            },

            renderUserPreference: function () {
                // bit of duplication here from function below
                if (window.localStorage) {
                    var existingPrefs = userPrefs.get(options.prefName);

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

            logPreference: function (shouldHideSection, section) {

                if (window.localStorage) {
                    var existingPrefs = userPrefs.get(options.prefName);

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
                        userPrefs.set(options.prefName, newPrefs);

                    // need to create it instead
                    } else {
                        userPrefs.set(options.prefName, section);
                    }

                }

            }

        };

        this.go = function (edition) {
            options.edition = edition;
            options.prefName = options.prefName + options.edition;
            view.showToggleLinks();
            view.renderUserPreference();
        };
        
        //View Listeners
        common.mediator.on('modules:trailblockToggle:toggle', view.toggleTrailblock);

    };

    return TrailblockToggle;

});