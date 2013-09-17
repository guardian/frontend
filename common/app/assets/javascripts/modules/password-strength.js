define(["common", "bonzo", "bean", "zxcvbn"], function (common, bonzo, bean, zxcvbn) {

    function PasswordStrength(el, context, config) {

        config = common.extend({
            text: {
                label: 'Password strength',
                long: 'Password too long',
                short: 'Password too short'
            },
            classes: {
                indicator: 'js-password-strength-indicator',
                label: 'js-password-strength-label',
                ready: 'has-indicator'
            },
            labels: [
                'weak',
                'poor',
                'medium',
                'good',
                'strong'
            ],
            minLength: 6,
            maxLength: 20
        }, config);

        var active = false,
            dom = {
                element: el
            },
            template = '<div class="' + config.classes.indicator + ' score-null">' +
                           '<div class="form-field__note form-field__note--below form-field__note--right ' + config.classes.label + ' h">' + config.text.label + '</div>' +
                       '</div>';

        this.init = function() {
            var $element = bonzo(dom.element);
            if (!$element.hasClass(config.classes.ready)) {
                dom.indicator = bonzo(bonzo.create(template)).insertAfter(dom.element)[0];
                dom.label = dom.indicator.querySelector('.' + config.classes.label);

                // Let's try keyup for now
                bean.on(dom.element, 'keyup.count', this.checkCount);
                bean.on(dom.element, 'keyup.key', this.checkStrength);
                this.checkCount();
                this.checkStrength();

                $element.addClass(config.classes.ready);
            }
        };

        this.checkCount = function(e) {
            if (dom.element.value.length >= config.minLength) {
                active = true;
                bonzo(dom.label).removeClass('h');
                bean.off(dom.element, 'keyup.count');
            }
        };

        this.checkStrength = function(e) {
            if (active) {
                var score = zxcvbn(dom.element.value).score,
                    label = config.text.label + ": " + config.labels[score];

                if (dom.element.value.length < config.minLength) {
                    label = config.text.short;
                    score = null;
                } else if (dom.element.value.length >= config.maxLength) {
                    label = config.text.long;
                    score = null;
                }

                dom.indicator.className = dom.indicator.className.replace(/\bscore-\S+/g, 'score-' + score);
                bonzo(dom.label).text(label);
            }
        };

    }

    return PasswordStrength;

});
