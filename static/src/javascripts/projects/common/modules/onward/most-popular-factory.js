define([
    'qwery',
    'common/modules/onward/popular',
    'common/modules/onward/socially-referred-burners'
], function (
    qwery,
    Popular,
    SocialBurners
) {

    function MostPopularFactory(config) {
        this.config = config;
        this.renderComponent();
    }
    MostPopularFactory.showReferredContent = false;
    MostPopularFactory.setShowReferred = function () {
        MostPopularFactory.showReferredContent = true;
    };

    MostPopularFactory.prototype.renderComponent = function () {
        if (MostPopularFactory.showReferredContent) {
            new SocialBurners(this.config, qwery('.js-referred')).init();
        } else {
            new Popular().init();
        }
    };
    return MostPopularFactory;

});
