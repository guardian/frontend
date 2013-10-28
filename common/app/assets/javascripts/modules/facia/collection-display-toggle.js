define(['common', 'bonzo', 'bean', 'modules/userPrefs'], function (common, bonzo, bean, userPrefs) {

    return function(collection) {

        var _$collection = bonzo(collection),
            _$button = bonzo(bonzo.create(
                '<button class="collection__display-toggle" data-link-name="Show">'
                    + '<i class="i i-arrow-white-large"></i>'
                    + '<span class="collection__display-toggle__text u-h">Hide</span>'
                +'</button>'
            )),
            _prefName = 'collection-states',
            _toggleText = {
                hidden: 'Show',
                displayed: 'Hide'
            },
            _state = 'displayed',
            _updatePref = function($collection, state) {
                // update user prefs
                var prefs = userPrefs.get(_prefName),
                    prefValue = $collection.attr('data-id');
                if (state === 'displayed') {
                    delete prefs[prefValue];
                } else {
                    if (!prefs) {
                        prefs = {};
                    }
                    prefs[prefValue] = 'closed';
                }
                userPrefs.set(_prefName, prefs);
            },
            _readPrefs = function($collection) {
                // update user prefs
                var prefs = userPrefs.get(_prefName);
                if (prefs && prefs[$collection.attr('data-id')]) {
                    bean.fire(_$button[0], 'click');
                }
            };

        // delete old key
        userPrefs.remove('front-trailblocks');

        this.addToggle =  function () {
            // append toggle button
            _$collection
                .prepend(_$button);
            // listen to event
            bean.on(_$button[0], 'click', function(e) {
                _state = (_state === 'displayed') ? 'hidden' : 'displayed';
                // add/remove rolled class
                _$collection[_state === 'displayed' ? 'removeClass' : 'addClass']('collection--rolled-up');
                // data-link-name is inverted, as happens before clickstream
                _$button.attr('data-link-name', _toggleText[_state === 'displayed' ? 'hidden' : 'displayed']);
                common.$g('.collection__display-toggle__text', _$button[0]).text(_toggleText[_state]);
                _updatePref(_$collection, _state);
            });
            _readPrefs(_$collection);
        };

    };

});
