define(['common', 'bean'], function (common, bean) {

    var ExperimentExpandableTrails = function () {

        this.id = 'ExpandableTrails';
        this.expiry = '2013-09-02';
        this.audience = 0.1;
        this.description = 'Impact of expandable trails on page views';
        this.canRun = function(config) {
            return (/^Video|Article|Gallery$/).test(config.page.contentType);
        };
        this.variants = [
            {
                id: 'control',
                test: function () {
                   return true;
                }
            },
            {
                id: 'expandable-trails',
                test: function (context) {
                    document.body.className += ' ab-expandable-trails--on';
                    bean.on(document.body, 'change', '.trail__expander-trigger', function(e) {
                        var trail = e.target.parentNode;
                        if (e.target.checked) {
                            trail.querySelector('.main-image').setAttribute('data-force-upgrade', true);
                            common.mediator.emit('fragment:ready:images', trail);
                        }
                    });
                }
            }
        ];
    };

    return ExperimentExpandableTrails;

});
