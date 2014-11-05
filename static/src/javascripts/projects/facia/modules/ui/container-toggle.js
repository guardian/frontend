define([
    'bean',
    'bonzo',
    'common/utils/$',
    'common/modules/userPrefs',
    'common/utils/template',
    'text!facia/views/button-toggle.html'
], function (
    bean,
    bonzo,
    $,
    userPrefs,
    template,
    toogleBtn
) {

    return function (container) {
        /* jscs:disable disallowDanglingUnderscores */

        var _$container = bonzo(container),
            _prefName = 'container-states',
            _toggleText = {
                hidden: 'Show',
                displayed: 'Hide'
            },
            _id = _$container.attr('id'),
            _$button = $.create(template(toogleBtn, {
                id:   _id,
                text: _toggleText.displayed
            })),
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
                .addClass('container--has-toggle');

            // listen to event
            bean.on(_$button[0], 'click', function () {
                _state = (_state === 'displayed') ? 'hidden' : 'displayed';

                // add/remove rolled class
                _$container[_state === 'displayed' ? 'removeClass' : 'addClass']('container--rolled-up');

                // check if element has aria attribute as not all containers are expandable
                if (_$container.attr('aria-expanded')) {
                    // set proper aria-expanded value
                    _$container.attr('aria-expanded', _state === 'displayed');
                }

                // data-link-name is inverted, as happens before clickstream
                _$button.attr('data-link-name', _toggleText[_state === 'displayed' ? 'hidden' : 'displayed']);
                $('.container__toggle__text', _$button[0]).html(_toggleText[_state] + ' <span class="u-h">section</span>');

                // hide/show the badge
                $('.ad-slot--paid-for-badge', container).css('display', _state === 'hidden' ? 'none' : 'block');
                _updatePref(_$container, _state);
            });

            _readPrefs(_$container);
        };

    };

});
