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
            'edition' : '',
            'prefName': 'front-trailblocks-'
        };

        var view = {

            showToggleLinks: function (context) {
                Array.prototype.forEach.call(context.querySelectorAll('.js-toggle-trailblock'), function(toggle){
                    bean.add(toggle, 'click', function (e) {
                        view.toggleTrailblock({
                            trigger: this,
                            context: context
                        });
                    });
                });
            },

            toggleTrailblock: function (opts) {

                var trigger       = opts.trigger,
                    manualTrigger = opts.manualTrigger,
                    context       = opts.context,
                    classPrefix = "front-trailblock-",
                    classesToToggle = 'rolled-out rolled-up',
                    trailblockId,
                    trailblock;

                if (manualTrigger) {
                    trigger = context.querySelector('.js-trigger-' + manualTrigger);
                }

                // convert trigger to bonzo object
                trigger = bonzo(trigger);

                trailblockId = trigger.attr('data-block-name');

                trailblock = '.' + classPrefix + trailblockId;

                trailblock = context.querySelector(trailblock);
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

            renderUserPreference: function (context) {
                // bit of duplication here from function below
                if (window.localStorage) {
                    var existingPrefs = userPrefs.get(options.prefName);

                    if (existingPrefs) {
                        var sectionArray = existingPrefs.split(',');
                        for (var i in sectionArray) {
                            var item = sectionArray[i];
                            view.toggleTrailblock({
                                manualTrigger: item,
                                context: context
                            });
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

        this.go = function (config, context) {
            options.prefName = options.prefName + config.page.edition;
            view.showToggleLinks(context);
            view.renderUserPreference(context);
        };

    };

    return TrailblockToggle;

});