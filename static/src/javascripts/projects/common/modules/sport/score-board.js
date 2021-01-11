import bonzo from 'bonzo';
import { Component } from 'common/modules/component';
import { isBreakpoint } from 'lib/detect';
import $ from 'lib/$';



const getScoreContainerHtml = (context) => `
    <div class="score-container">
        <div class="score__loading ${context.loadingState}">
            <div class="loading__text">Fetching the scores…</div>
            <div class="is-updating"></div>
        </div>
    </div>
`;

class ScoreBoard extends Component {
    constructor(context) {
        super();

        Object.assign(this, context);

        const scoreContainerHtml = getScoreContainerHtml({
            loadingState:
                this.pageType !== 'report' ? ' score__loading--live' : '',
        });

        this.updateEvery = isBreakpoint({ min: 'desktop' }) ? 30 : 60;
        this.placeholder = bonzo.create(scoreContainerHtml)[0];

        if (this.pageType === 'report') {
            context.parent.after(this.placeholder);
        } else {
            context.parent.addClass('u-h').before(this.placeholder);
        }
    }

    placeholder;
    pageType;
    parent;

    prerender() {
        const scoreLoadingPlaceholder = $(
            '.score__loading',
            $(this.placeholder)
        );

        if (scoreLoadingPlaceholder.length) {
            scoreLoadingPlaceholder.remove();
        }
    }

    ready() {
        this.setState(this.pageType);
    }

    load() {
        this.fetch(this.placeholder);
    }

    loadFromJson(html) {
        this.template = html;
        this.render(this.placeholder);
    }

    error() {
        this.placeholder.innerHTML = '';
        this.parent.removeClass('u-h');
    }
}

export { ScoreBoard };
