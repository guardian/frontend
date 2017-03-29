define([
    'Promise',
    'lib/fastdom-promise',
    'lib/$',
    'lodash/utilities/template',
    'common/modules/user-prefs',
    'raw-loader!commercial/views/survey/survey-simple.html',
    'svg-loader!svgs/icon/arrow-white-right.svg',
    'svg-loader!svgs/icon/marque-36.svg',
    'svg-loader!svgs/icon/cross.svg',
    'svg-loader!svgs/commercial/paid-content.svg',
    'lodash/arrays/uniq'
], function (
    Promise,
    fastdom,
    $,
    template,
    userPrefs,
    surveySimpleTemplate,
    arrowWhiteRight,
    marque36icon,
    crossIcon,
    paidContent,
    uniq
) {
    var surveySimple = function (config) {
        this.config = config || {};
        this.id = this.config.id;
        this.prefs = 'overlay-messages';
        this.shouldClosePermanently = this.config.shouldClosePermanently || false;
        this.bannerTmpl = template(surveySimpleTemplate,
            {
                header: this.config.header,
                paragraph1: this.config.paragraph1,
                paragraph2: this.config.paragraph2,
                paragraph3: this.config.paragraph3,
                showCloseBtn: this.config.showCloseBtn,
                arrowWhiteRight: arrowWhiteRight.markup,
                marque36icon: marque36icon.markup,
                crossIcon: crossIcon.markup,
                paidContent: paidContent.markup
            });
    };

    surveySimple.prototype.attach = function () {
        if (!this.hasSeen()) {
            return fastdom.write(function () {
                $(document.body).append(this.bannerTmpl);

                if (this.config.showCloseBtn) {
                    var closeBtn = document.querySelector('.js-survey-close');
                    closeBtn.addEventListener('click', this.handleClick.bind(this));
                }
            }.bind(this));
        } else {
            return Promise.resolve();
        }
    };

    surveySimple.prototype.handleClick = function () {
        $('.js-survey-overlay').addClass('u-h');
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
        userPrefs.set(this.prefs, uniq(messageStates));
    };

    surveySimple.prototype.show = function () {
        fastdom.write(function () {
            $('.js-survey-overlay').removeClass('u-h');
        });
    };

    return surveySimple;
});
