/*global guardian */
define(['common', 'bean', 'modules/popular', 'modules/related'], function (common, bean, popular, related) {

    var ExperimentExpandableMostPopular = function () {

        var cleanStoryPackage = function(context) {
            var trails = context.getElementsByClassName('related-trails')[0].getElementsByClassName('trail');
            common.toArray(trails).forEach(function(el){
                var img = el.getElementsByClassName('trail__img')[0],
                    text = el.getElementsByClassName('trail__text')[0];
                if(img) { img.parentNode.removeChild(img); }
                if(text) { text.parentNode.removeChild(text); }
            });
        };

        this.id = 'ExpandableMostPopular';
        this.expiry = '2013-09-30';
        this.audience = 1;
        this.description = 'Impact of expandable most popular trails on page views';
        this.canRun = function(config) {
            return true;
        };
        this.variants = [
            {
                id: 'control',
                test: function (context) {
                    related(guardian.config, context);
                    popular(guardian.config, context);
                }
            },
            {
                id: 'expandable-most-popular',
                test: function (context) {
                    common.mediator.on('modules:related:loaded', function() {
                        cleanStoryPackage(context);
                    });
                    related(guardian.config, context);

                    if((/^Video|Article|Gallery$/).test(guardian.config.page.contentType)) {
                        popular(guardian.config, context, true);
                        bean.on(document.body, 'change', '.trail__expander-trigger', function(e) {
                            var trail = e.target.parentNode;
                            if (e.target.checked) {
                                trail.querySelector('.main-image').setAttribute('data-force-upgrade', true);
                                common.mediator.emit('fragment:ready:images', trail);
                            }
                        });
                    } else {
                        popular(guardian.config, context);
                    }
                }
            }
        ];
    };

    return ExperimentExpandableMostPopular;

});
