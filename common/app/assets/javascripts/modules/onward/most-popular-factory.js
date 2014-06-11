define([
        'common/utils/context',
        'qwery',
        'common/modules/onward/popular',
        'common/modules/onward/socially-referred-burners'
    ],function(
        context,
        qwery,
        popular,
        SocialBurners
        ) {

        function MostPopularFactory(config) {
            this.config = config;
            this.context = context();
            this.renderComponent();
        }
        MostPopularFactory.showReferredContent = false;
        MostPopularFactory.setShowReferred = function() {
            MostPopularFactory.showReferredContent = true;
        };

        MostPopularFactory.prototype.renderComponent = function() {
            if(MostPopularFactory.showReferredContent) {
                new SocialBurners(this.config, qwery('.js-referred', this.context)).init();
            } else {
                popular(this.config, this.context);
            }
        };
        return MostPopularFactory;
    }
);
