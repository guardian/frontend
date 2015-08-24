import ko from 'knockout';
import _ from 'underscore';
import LatestArticles from 'models/collections/latest-articles';
import mediator from 'utils/mediator';
import updateScrollables from 'utils/update-scrollables';
import ColumnWidget from 'widgets/column-widget';

class Latest extends ColumnWidget {
    constructor(params, element) {
        super(params, element);

        this.showingDrafts = ko.observable(false);
        this.latestArticles = new LatestArticles({
            container: element,
            showingDrafts: this.showingDrafts,
            callback: _.once(function () {
                mediator.emit('latest:loaded');
            })
        });

        this.latestArticles.search();
        this.latestArticles.startPoller();

        this.subscribeOn(this.baseModel.switches, switches => {
            if (this.showingDrafts() && !switches['facia-tool-draft-content']) {
                this.showLive();
            }
        });
        this.subscribeOn(this.latestArticles.articles, updateScrollables);
    }

    showDrafts() {
        this.showingDrafts(true);
        this.latestArticles.search();
    }

    showLive() {
        this.showingDrafts(false);
        this.latestArticles.search();
    }

    dispose() {
        super.dispose();
        this.latestArticles.dispose();
    }
}

export default Latest;
