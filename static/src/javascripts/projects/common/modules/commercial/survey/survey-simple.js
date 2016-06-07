define([
    'bean',
    'fastdom',
    'common/utils/$',
    'common/utils/template',
    'common/modules/user-prefs',
    'common/views/svgs',
    'text!common/views/commercial/survey/survey-simple.html',
    'lodash/arrays/uniq'
], function (
    bean,
    fastdom,
    $,
    template,
    userPrefs,
    svgs,
    surveySimpleTemplate,
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
                arrowWhiteRight: svgs('arrowWhiteRight'),
                marque36icon: svgs('marque36icon'),
                crossIcon: svgs('crossIcon'),
                paidContent: svgs('paidContent')
            });
    };

    surveySimple.prototype.attach = function () {
        if (!this.hasSeen()) {
            fastdom.write(function () {
                $(document.body).append(this.bannerTmpl);

                if (this.config.showCloseBtn) {
                    bean.on(document, 'click', $('.js-survey-close'), this.handleClick.bind(this));
                }
            }.bind(this));
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
