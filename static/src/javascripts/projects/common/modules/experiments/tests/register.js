define([
    'common/utils/$',
    'common/utils/cookies'
], function (
    $,
    cookies
) {
    return function () {
        this.id = 'Register';
        this.start = '2015-03-23';
        this.expiry = '2015-04-01';
        this.author = 'Oliver Ash';
        this.description = 'Testing to see if showing a register button (of some kind) will increase the conversion rate.';
        this.audience = 0.25;
        this.audienceOffset = 0;
        this.successMeasure = 'More users register upon visiting the website.';
        this.audienceCriteria = 'All users who are signed out';
        this.dataLinkNames = 'Register link';
        this.idealOutcome = 'Conversion rate increases';

        this.canRun = function () {
            return !cookies.get('GU_U');
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
                    + '?returnUrl=https://membership.theguardian.com/join/friend/enter-details&skipConfirmation=true');
            },
            becomeAFriend = function () {
                $registerText.text('become a friend');
                applyMembershipLink();
            },
            becomeAMember = function () {
                $registerText.text('become a member');
                applyMembershipLink();
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
                id: 'register',
                test: function () {
                    show();
                }
            },
            {
                id: 'become-a-friend',
                test: function () {
                    show();
                    becomeAFriend();
                }
            },
            {
                id: 'become-a-member',
                test: function () {
                    show();
                    becomeAMember();
                }
            },
            {
                id: 'register+free',
                test: function () {
                    show();
                    free();
                }
            },
            {
                id: 'become-a-friend+free',
                test: function () {
                    show();
                    becomeAFriend();
                    free();
                }
            },
            {
                id: 'become-a-member+free',
                test: function () {
                    show();
                    becomeAMember();
                    free();
                }
            }
        ];
    };

});
