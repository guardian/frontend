

import config from "lib/config";
import mediator from "lib/mediator";
import { begin, error, end } from "common/modules/analytics/register";
import { Component } from "common/modules/component";

const getTag = (): string => [...config.get('page.nonKeywordTagIds', '').split(','), ...config.get('page.blogIds', '').split(','), ...[config.get('page.seriesId')]].shift();

const getShortUrl = (): string => encodeURIComponent(config.get('page.shortUrl'));

class OnwardContent extends Component {

  constructor(context: HTMLElement): void {
    super();

    begin('series-content');

    this.endpoint = `/series/${getTag()}.json?shortUrl=${getShortUrl()}`;

    this.fetch(context, 'html');
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