import bean from 'bean';
import $ from 'lib/$';
import { fetchJson } from 'lib/fetch-json';
import { mediator } from 'lib/mediator';
import reportError from 'lib/report-error';



// Keys must be strings for Flow: https://github.com/facebook/flow/issues/380
const keyCodeMap = {
    '13': 'enter',
    '38': 'up',
    '40': 'down',
    '27': 'escape',
};


export class SearchTool {


    constructor(options) {
        const container = options.container;
        this.apiUrl = options.apiUrl;

        this.bindElements(container);
        this.bindEvents();

        this.oldQuery = '';
        this.newQuery = '';
        this.inputTmp = '';
    }

    static nearestLinkNode(target) {
        if ($(target).hasClass('js-search-tool-link')) {
            return target;
        }
        return $.ancestor(target, 'js-search-tool-link');
    }

    bindElements(container) {
        this.$list = $('.js-search-tool-list', container);
        this.$input = $('.js-search-tool-input', container);
    }

    bindEvents() {
        bean.on(document.body, 'keyup', this.handleKeyEvents.bind(this));
        bean.on(document.body, 'click', this.handleClick.bind(this));

        mediator.on('autocomplete:toggle', this.toggleControls.bind(this));
    }

    hasInputValueChanged() {
        return this.oldQuery.length !== this.newQuery.length;
    }

    handleClick(e) {
        const isInput = $(e.target).hasClass('js-search-tool-input');
        const isLink = SearchTool.nearestLinkNode(e.target);

        if (isInput) {
            e.preventDefault();
            mediator.emit('autocomplete:toggle', true);
        } else if (isLink) {
            e.preventDefault();
            $('.active', this.$list).removeClass('active');
            $(isLink).addClass('active');
            this.pushData();
        } else {
            mediator.emit('autocomplete:toggle', false);
        }
    }

    toggleControls(value) {
        const $input = $('.js-search-tool-input')[0];
        const $location = $('.js-search-tool');
        const $close = $('.js-close-location');

        if (value) {
            this.inputTmp = $input.value;
            $location.addClass('is-editing');
            $input.setSelectionRange(0, $input.value.length);
            $close.removeClass('u-h');
        } else {
            $location.removeClass('is-editing');
            this.clear();
            this.setInputValue(this.inputTmp);
            $close.addClass('u-h');
        }
    }

    pushData() {
        const $active = $('.active', this.$list);
        let store = 'set';

        if ($active.length === 0) {
            if (this.$input.val() === '') {
                store = 'remove';
            } else {
                return;
            }
        }

        const data = {
            id: $active.attr('data-weather-id'),
            city: $active.attr('data-weather-city'),
            store,
        };

        // Send data to whoever is listening
        mediator.emit('autocomplete:fetch', data);
        this.setInputValue();
        this.inputTmp = data.city;
        this.$input.blur();

        // Clear all after timeout because of the tracking we can't remove everything straight away
        setTimeout(this.destroy.bind(this), 50);
    }

    getListOfResults(e) {
        this.newQuery = e.target.value;

        // If we have empty input clear everything and don't fetch the data
        if (!e.target.value.match(/\S/)) {
            this.clear();
            this.oldQuery = '';
            return;
        }

        // If input value hasn't changed don't fetch the data
        if (!this.hasInputValueChanged()) {
            return;
        }

        this.fetchData();
    }

    fetchData() {
        return fetchJson(`${this.apiUrl}${this.newQuery}`, {
            mode: 'cors',
        })
            .then(positions => {
                this.renderList(positions, 5);
                this.oldQuery = this.newQuery;
            })
            .catch(ex => {
                reportError(ex, {
                    feature: 'search-tool',
                });
            });
    }

    handleKeyEvents(e) {
        const key = keyCodeMap[e.which || e.keyCode];

        // Run this function only if we are inside the input
        if (!$(e.target).hasClass('js-search-tool-input')) {
            return;
        }

        if (key === 'down') {
            // down
            e.preventDefault();
            this.move(1);
        } else if (key === 'up') {
            // up
            e.preventDefault();
            this.move(-1);
        } else if (key === 'enter') {
            // enter
            this.pushData();
        } else if (key === 'escape') {
            this.toggleControls();
        } else {
            this.getListOfResults(e);
        }
    }

    move(increment) {
        const $active = $('.active', this.$list);
        let id = parseInt($active.attr('id'), 10);

        if (Number.isNaN(id)) {
            id = -1;
        }

        $active.removeClass('active');

        // When outside of the list show latest query
        if (this.getNewId(id + increment) < 0) {
            this.setInputValue(this.oldQuery);

            // When looping inside of the list show list item
        } else {
            $(`#${this.getNewId(id + increment)}sti`, this.$list).addClass(
                'active'
            );
            this.setInputValue();
        }
    }

    getNewId(id) {
        const len = $('li', this.$list).length;
        let newId = id % len;

        // Make sure that we can hit saved input option which has position -1
        if (newId < -1) {
            newId = len - 1;
        } else if (id === len) {
            newId = -1;
        }

        return newId;
    }

    setInputValue(value) {
        const inputValue =
            value || $('.active', this.$list).attr('data-weather-city');

        this.$input.val(inputValue);
    }

    renderList(results, resultsToShow) {
        const docFragment = document.createDocumentFragment();

        results.slice(0, resultsToShow).forEach((item, index) => {
            const li = document.createElement('li');

            li.className = 'search-tool__item';
            li.innerHTML =
                `<a role="button" href="#${item.id}"` +
                ` id="${index}sti" class="js-search-tool-link search-tool__link${
                    index === 0 ? ' active"' : '"'
                } data-link-name="weather-search-tool" data-weather-id="${
                    item.id
                }" data-weather-city="${item.city}">${
                    item.city
                } <span class="search-tool__meta">${item.country}</span></a>`;

            docFragment.appendChild(li);
        });

        this.clear().append(docFragment);
    }

    clear() {
        return this.$list.html('');
    }

    destroy() {
        this.clear();
    }
}
