define([
    'knockout',
    'models/collections/latest-articles',
    'modules/vars',
    'utils/mediator',
    'utils/update-scrollables'
], function (
    ko,
    LatestArticles,
    vars,
    mediator,
    updateScrollables
) {

    function Latest (params, element) {
        this.column = params.column;

        this.latestArticles = new LatestArticles({
            filterTypes: vars.CONST.filterTypes,
            container: element
        });

        this.latestArticles.search();
        this.latestArticles.startPoller();

        this.subscriptionOnArticles = this.latestArticles.articles.subscribe(updateScrollables);

        mediator.emit('latest:loaded');
    }

    Latest.prototype.dispose = function () {
        this.subscriptionOnArticles.dispose();
    };

    return Latest;
});
