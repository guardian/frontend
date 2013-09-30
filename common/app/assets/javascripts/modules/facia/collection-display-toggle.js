define(['common', 'bonzo', 'bean', 'modules/userPrefs'], function (common, bonzo, bean, userPrefs) {

    return function(collection, config) {

        var _$collection = bonzo(collection),
            _$button = bonzo(bonzo.create('<button class="collection__display-toggle" data-link-name="Show">Hide<span class="u-h"> section</span></button>')),
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
                _$button
                    .text(_toggleText[newState])
                    // data-link-name is inverted, as happens before clickstream
                    .attr('data-link-name', _toggleText[newState === 'displayed' ? 'hidden' : 'displayed']);
                _updatePref(_$collection, newState);
            });
            _readPrefs(_$collection);
        };

    };

});
