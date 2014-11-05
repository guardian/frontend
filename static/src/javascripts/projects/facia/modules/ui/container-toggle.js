define([
    'bean',
    'bonzo',
    'common/utils/$',
    'common/modules/userPrefs'
], function (
    bean,
    bonzo,
    $,
    userPrefs
) {

    return function (container) {
        /* jscs:disable disallowDanglingUnderscores */

        var _$container = bonzo(container),
            _$button = bonzo(bonzo.create(
                '<button class="fc-container__toggle" data-link-name="Show">'
                    + '<i class="i i-arrow-grey-large"></i>'
                    + '<span class="fc-container__toggle__text">Hide</span>'
                + '</button>'
            )),
            _prefName = 'container-states',
            _toggleText = {
                hidden: 'Show',
                displayed: 'Hide'
            },
            _state = 'displayed',
            _updatePref = function ($container, state) {
                // update user prefs
                var prefs = userPrefs.get(_prefName),
                    prefValue = $container.attr('data-id');
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
            _readPrefs = function ($container) {
                // update user prefs
                var prefs = userPrefs.get(_prefName);
                if (prefs && prefs[$container.attr('data-id')]) {
                    bean.fire(_$button[0], 'click');
                }
            };

        // delete old key
        userPrefs.remove('front-trailblocks');

        this.addToggle =  function () {
            // append toggle button
            $('.js-container__header', _$container[0]).append(_$button);
            _$container
                .removeClass('js-container--toggle')
                .addClass('fc-container--has-toggle');
            // listen to event
            bean.on(_$button[0], 'click', function () {
                _state = (_state === 'displayed') ? 'hidden' : 'displayed';
                // add/remove rolled class
                _$container[_state === 'displayed' ? 'removeClass' : 'addClass']('fc-container--rolled-up');
                // data-link-name is inverted, as happens before clickstream
                _$button.attr('data-link-name', _toggleText[_state === 'displayed' ? 'hidden' : 'displayed']);
                $('.fc-container__toggle__text', _$button[0]).text(_toggleText[_state]);
                // hide/show the badge
                $('.ad-slot--paid-for-badge', container).css('display', _state === 'hidden' ? 'none' : 'block');
                _updatePref(_$container, _state);
            });
            _readPrefs(_$container);
        };

    };

});
