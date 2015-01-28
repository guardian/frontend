define([
    'bean',
    'raven',
    'common/utils/$',
    'common/utils/_',
    'common/utils/ajax',
    'common/utils/mediator'
], function (
    bean,
    raven,
    $,
    _,
    ajax,
    mediator
    ) {
    function SearchTool(options) {
        var $list      = null,
            $input     = null,
            oldQuery   = '',
            newQuery   = '',
            keyCodeMap = {
                13: 'enter',
                38: 'up',
                40: 'down'
            },
            opts       = options || {},
            $container = opts.container,
            apiUrl     = opts.apiUrl;

        return {
            init: function () {
                $list  = $('.js-search-tool-list', $container);
                $input = $('.js-search-tool-input', $container);

                this.bindEvents();
            },

            bindEvents: function () {
                bean.on(document.body, 'keyup', this.handleKeyEvents.bind(this));
                bean.on(document.body, 'click', '.js-search-tool-list a', this.handleClick.bind(this));
            },

            hasInputValueChanged: function () {
                return (oldQuery.length !== newQuery.length);
            },

            handleClick: function (e) {
                e.preventDefault();

                $(e.currentTarget).addClass('active');
                this.pushData();
            },

            pushData: function () {
                var $active = $('.active', $list),
                    data    = {},
                    store   = 'set';

                if ($active.length === 0) {
                    if ($input.val() === '') {
                        store = 'remove';
                    } else {
                        return false;
                    }
                }

                data = {
                    'id': $active.attr('data-weather-id'),
                    'city': $active.attr('data-weather-city'),
                    'store': store
                };

                // Send data to whoever is listening
                mediator.emit('autocomplete:fetch', data);
                this.setInputValue();
                this.track(data.city);

                $input.blur();

                // Clear all after timeout because of the tracking we can't remove everything straight away
                setTimeout(this.destroy.bind(this), 50);

                return data;
            },

            track: function (city) {
                s.events = 'event100';
                s.prop22 = city;
                s.eVar22 = city;
                s.linkTrackVars = 'prop22,eVar22';
                s.linkTrackEvents = 'event100';
                s.tl(true, 'o', 'weather location set by user');
            },

            getListOfResults: function (e) {
                newQuery = e.target.value;

                // If we have empty input clear everything and don't fetch the data
                if (!e.target.value.match(/\S/)) {
                    this.clear();
                    oldQuery = '';
                    return;
                }

                // If input value hasn't changed don't fetch the data
                if (!this.hasInputValueChanged()) {
                    return;
                }

                this.fetchData();
            },

            fetchData: function () {
                return ajax({
                    url: apiUrl + newQuery,
                    type: 'json',
                    crossOrigin: true
                }).then(function (positions) {
                    this.renderList(positions, 5);
                    oldQuery = newQuery;
                }.bind(this));
            },

            handleKeyEvents: function (e) {
                var key = keyCodeMap[e.which || e.keyCode];

                // Run this function only if we are inside the input
                if (!$(e.target).hasClass('js-search-tool-input')) {
                    return;
                }

                if (key === 'down') { // down
                    e.preventDefault();
                    this.move(1);
                } else if (key === 'up') { // up
                    e.preventDefault();
                    this.move(-1);
                } else if (key === 'enter') { // enter
                    this.pushData();
                } else {
                    this.getListOfResults(e);
                }
            },

            move: function (increment) {
                var $active = $('.active', $list),
                    id      = parseInt($active.attr('id'), 10);

                if (isNaN(id)) {
                    id = -1;
                }

                $active.removeClass('active');

                // When outside of the list show latest query
                if (this.getNewId(id + increment) < 0) {
                    this.setInputValue(oldQuery);

                    // When looping inside of the list show list item
                } else {
                    $('#' + this.getNewId(id + increment) + 'sti', $list).addClass('active');
                    this.setInputValue();
                }
            },

            getNewId: function (id) {
                var len   = $('li', $list).length,
                    newId = id % len;

                // Make sure that we can hit saved input option which has position -1
                if (newId < -1) {
                    newId = len - 1;
                } else if (id === len) {
                    newId = -1;
                }

                return newId;
            },

            setInputValue: function (value) {
                var inputValue = value || $('.active', $list).attr('data-weather-city');

                $input.val(inputValue);
            },

            renderList: function (results, numOfResults) {
                var docFragment   = document.createDocumentFragment(),
                    resultsToShow = results.length - numOfResults;

                _(results).initial(resultsToShow).each(function (item, index) {
                    var li = document.createElement('li');

                    li.className = 'search-tool__item';
                    li.innerHTML = '<a role="button" href="#' + item.id + '"' +
                        ' id="' + index + 'sti" class="search-tool__link' + (index === 0 ? ' active"' : '"') +
                        ' data-link-name="weather-search-tool" data-weather-id="' + item.id + '" data-weather-city="' + item.city + '">' +
                        item.city + ' <span class="search-tool__meta">' + item.country + '</span></a>';

                    docFragment.appendChild(li);
                });

                this.clear().append(docFragment);
            },

            clear: function () {
                return $list.html('');
            },

            destroy: function () {
                this.clear();
            }
        };
    }

    return SearchTool;
});
