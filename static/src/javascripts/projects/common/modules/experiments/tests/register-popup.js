define([
    'bean',
    'common/utils/$',
    'common/modules/identity/api'
], function (
    bean,
    $,
    Id
) {
    return function () {
        this.id = 'RegisterPopup';
        this.start = '2015-03-24';
        this.expiry = '2015-04-08';
        this.author = 'Oliver Ash';
        this.description = 'Testing to see if showing a register popup will increase the conversion rate.';
        this.audience = 0.25;
        this.audienceOffset = 0.25;
        this.successMeasure = 'More users register upon visiting the website.';
        this.audienceCriteria = 'All users who are signed out';
        this.dataLinkNames = 'Register link';
        this.idealOutcome = 'Conversion rate increases';

        this.canRun = function () {
            return !Id.isUserLoggedIn();
        };

        var $register = $('.js-register'),
            $registerText = $('.js-control-info', $register),
            $registerLink = $('a', $register),
            // Common mutations
            show = function () {
                $register.removeClass('u-h');
            },
            applyMembershipLink = function () {
                $registerLink.attr('href', $registerLink.attr('href')
                    + '?returnUrl=' + encodeURIComponent('https://membership.theguardian.com/join/friend/enter-details')
                    + '&skipConfirmation=true');
            },
            becomeAMember = function () {
                $registerText.text('become a member');
                applyMembershipLink();
            },
            onHover = function (toggleFn) {
                bean.on($register[0], 'mouseenter', toggleFn);
                bean.on($register[0], 'mouseleave', toggleFn);
            },
            free = function () {
                $('.brand-bar__item__badge', $register).removeClass('u-h');
            };

        this.variants = [
            {
                id: 'control',
                test: function () { }
            },
            {
                id: 'polly-toynbee-quote',
                test: function () {
                    show();
                    becomeAMember();
                    free();
                    applyMembershipLink();

                    var $popup = $('.js-popup-polly-toynbee-quote', $register),
                        togglePopup = function () {
                            // FIXME: Find a nicer way to fade in/out whilst toggling
                            // the display style to none
                            if ($popup.css('opacity') === '0') {
                                $popup.toggleClass('u-h');
                                $popup.css('opacity', '1');
                            } else {
                                $popup.css('opacity', '');
                                setTimeout(function () {
                                    $popup.toggleClass('u-h');
                                }, 300);
                            }
                        };
                    onHover(togglePopup);
                }
            },
            {
                id: 'membership-benefits',
                test: function () {
                    show();
                    becomeAMember();
                    free();
                    applyMembershipLink();

                    var $popup = $('.js-popup-membership-benefits', $register),
                        togglePopup = function () {
                            // FIXME: Find a nicer way to fade in/out whilst toggling
                            // the display style to none
                            if ($popup.css('opacity') === '0') {
                                $popup.toggleClass('u-h');
                                $popup.css('opacity', '1');
                            } else {
                                $popup.css('opacity', '');
                                setTimeout(function () {
                                    $popup.toggleClass('u-h');
                                }, 1000);
                            }

                        };
                    onHover(togglePopup);
                }
            }
        ];
    };

});
