define(['common', 'bonzo', 'bean', 'modules/userPrefs'], function (common, bonzo, bean, userPrefs) {

    return function(collection, config) {

        var _$collection = bonzo(collection),
            _$button = bonzo(bonzo.create('<button class="collection__display-toggle" data-link-name="Show"><span class="collection__display-toggle__text">Hide</span></button>'))
                           .append('<span class="u-h"> ' + _$collection.attr('data-section') + '</span>'),
            _prefName = 'front-trailblocks',
            _edition = config.page.edition.toLowerCase(),
            _toggleText = {
                hidden: 'Show',
                displayed: 'Hide'
            },
            _initialState = 'displayed',
            _dataAttr = 'data-toggle-state',
            _updatePref = function($collection, state) {
                // update user prefs
                var prefs = userPrefs.get(_prefName),
                    prefValue = $collection.attr('data-collection-type') + '|' + $collection.attr('data-section');
                if (state === 'displayed') {
                    delete prefs[_edition][prefValue];
                } else {
                    if (!prefs) {
                        prefs = {};
                    }
                    if (!prefs[_edition]) {
                        prefs[_edition] = {};
                    }
                    prefs[_edition][prefValue] = 1;
                }
                userPrefs.set(_prefName, prefs);
            },
            _readPrefs = function($collection) {
                // update user prefs
                var prefs = userPrefs.get(_prefName),
                    prefValue = $collection.attr('data-collection-type') + '|' + $collection.attr('data-section');
                if (prefs && prefs[_edition] && prefs[_edition][prefValue]) {
                    bean.fire(_$button[0], 'click');
                }
            };

        this.addToggle =  function () {
            // append toggle button
            _$collection
                .attr(_dataAttr, _initialState)
                .prepend(_$button);
            // listen to event
            bean.on(_$button[0], 'click', function(e) {
                var newState = (_$collection.attr(_dataAttr) === 'displayed') ? 'hidden' : 'displayed';
                _$collection
                    [newState === 'displayed' ? 'removeClass' : 'addClass']('collection--rolled-up')
                    .attr(_dataAttr, newState);
                // data-link-name is inverted, as happens before clickstream
                _$button.attr('data-link-name', _toggleText[newState === 'displayed' ? 'hidden' : 'displayed']);
                common.$g('.collection__display-toggle__text', _$button[0]).text(_toggleText[newState]);
                _updatePref(_$collection, newState);
            });
            _readPrefs(_$collection);
        };

    };

});
