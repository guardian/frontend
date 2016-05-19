define([
    'fastdom',
    'common/utils/template',
    'common/modules/user-prefs',
    'inlineSvg!svgs/icon/arrow-white-right',
    'inlineSvg!svgs/icon/marque-36',
    'inlineSvg!svgs/icon/cross',
    'text!common/views/commercial/survey/survey-simple.html'
], function (
    fastdom,
    template,
    userPrefs,
    arrowWhiteRight,
    marque36icon,
    crossIcon,
    surveySimpleTemplate
) {
    var surveySimple = function (config) {
        this.config = config || {};
        this.id = this.config.id;
        this.prefs = 'overlay-messages';
        this.shouldClosePermanently = this.config.shouldClosePermanently || false;
        this.bannerTmpl = template(surveySimpleTemplate,
            {
                surveyHeader: this.config.surveyHeader,
                surveyText: this.config.surveyText,
                buttonText: this.config.buttonText,
                buttonLink: this.config.buttonLink,
                buttonDataLink: this.config.membershipDataLink,
                showCloseBtn: this.config.showCloseBtn,
                arrowWhiteRight: arrowWhiteRight,
                marque36icon: marque36icon,
                crossIcon: crossIcon
            });
    };

    surveySimple.prototype.attach = function () {
        if (!this.hasSeen()) {
            fastdom.write(function () {
                document.body.insertAdjacentHTML('beforeend', this.bannerTmpl);
                this.element = document.body.lastElementChild;

                if (this.config.showCloseBtn) {
                    this.element.querySelector('.js-survey-close').addEventListener('click', this.handleClick.bind(this));
                    this.element.querySelector('.js-survey-link__takepart').addEventListener('click', this.handleClick.bind(this));
                }
            }, this);
        }
    };

    surveySimple.prototype.handleClick = function () {
        this.element.setAttribute('hidden', 'hidden');
        if (this.shouldClosePermanently) {
            this.closePermanently();
        }
    };

    surveySimple.prototype.hasSeen = function () {
        var messageStates = userPrefs.get(this.prefs);
        return messageStates && messageStates.indexOf(this.id) > -1;
    };

    surveySimple.prototype.closePermanently = function () {
        var messageStates = userPrefs.get(this.prefs) || [];
        messageStates.push(this.id);
        userPrefs.set(this.prefs, messageStates.reduce(function (result, input) {
            if (result.indexOf(input) === -1) {
                result.push(input);
            }
            return result;
        }, []));
    };

    surveySimple.prototype.show = function () {
        fastdom.write(function () {
            this.element.removeAttribute('hidden');
        }, this);
    };

    return surveySimple;
});
