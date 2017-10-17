// @flow

import config from 'lib/config';
import mediator from 'lib/mediator';
import { begin, error, end } from 'common/modules/analytics/register';
import { Component } from 'common/modules/component';

const getTag = (): string =>
    [
        ...config.page.nonKeywordTagIds.split(','),
        ...config.page.blogIds.split(','),
        ...[config.page.seriesId],
    ].shift();

class OnwardContent extends Component {
    constructor(context: HTMLElement): void {
        super();

        begin('series-content');

        this.context = context;
        this.endpoint = `/series/${getTag()}.json?shortUrl=${encodeURIComponent(
            config.page.shortUrl
        )}`;

        this.fetch(this.context, 'html');
    }

    // eslint-disable-next-line class-methods-use-this
    error(): void {
        error('series-content');
    }

    // eslint-disable-next-line class-methods-use-this
    ready(): void {
        end('series-content');
        mediator.emit('modules:onward:loaded');
    }
}

export { OnwardContent };
