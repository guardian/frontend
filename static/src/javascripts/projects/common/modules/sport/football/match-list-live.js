// @flow

import $ from 'lib/$';
import { Component } from 'common/modules/component';

class MatchListLive extends Component {
    constructor(type: string, competition: string | true, date: ?string): void {
        super();

        const slug = ['football', type, competition, date]
            .filter(e => e)
            .join('/');

        this.autoupdated = true;
        this.updateEvery = 10;
        this.endpoint = `/${slug}.json`;
    }

    autoupdate(elem: HTMLElement): void {
        const updated = $('.football-match', elem);

        $('.football-match', this.elem).each((match, i) => {
            const $match = bonzo(match).removeClass('football-match--updated');
            const $updated = bonzo(updated[i]);

            ['score-home', 'score-away', 'match-status'].forEach(state => {
                const stateData = `data-${state}`;

                if ($updated.attr(stateData) !== $match.attr(stateData)) {
                    $match.replaceWith(
                        $updated.addClass('football-match--updated')
                    );

                    this.prerender();
                }
            });
        });
    }

    prerender(): void {
        const elem = this.elem;

        $('.football-team__form', elem).remove();
        $('.date-divider', elem).remove();
        $(this.elem).addClass('table--small');

        $('.football-matches__date', this.elem).replaceWith(
            '<span class="item__live-indicator">Live</span>'
        );
    }
}

export { MatchListLive };
