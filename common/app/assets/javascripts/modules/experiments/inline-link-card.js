/*
    Module: inline-link-card.js
    Description: Load in data from the linked page and display in sidebar
*/
define([
    '$',
    'utils/mediator',
    'utils/detect',
    'utils/ajax'
], function (
    $,
    mediator,
    detect,
    ajax
) {
    /**
     * @param {DOMElement} link        The link to transform
     * @param {DOMElement} linkContext Where the card should be inserted
     * @param {String}     title       Give a heading to the card
     */
    function InlineLinkCard(link, linkContext, title) {
        this.link = link;
        this.title = title || false;
        this.$linkContext = $(linkContext);
    }

    InlineLinkCard.prototype.init = function() {
        var self = this;
        self.loadCard();

        mediator.addListener('window:resize', function(e) {
            self.loadCard();
        });
    };

    InlineLinkCard.prototype.loadCard = function() {
        var breakpoint = detect.getBreakpoint();

        if (breakpoint === 'wide' && !this.link.getAttribute('data-hasbeencardified')) {
            this.link.setAttribute('data-hasbeencardified', true);
            this.fetchData();
        }
    };

    InlineLinkCard.prototype.prependCard = function(href, data, title) {
        var self = this,
            headline = data.title || false,
            description = data.description || false,
            image = data.image || false,
            datePublished = data.published_time || false,
            host = data.host || false,
            tpl,
            imageFragment = '',
            publishedFragment = '',
            contentFragment = '';

        if (!headline) {
            return false;
        }

        if (image) {
            imageFragment = '<img src="' + image + '" alt="" class="card__media" />';
        }
        if (datePublished) {
            publishedFragment = '<div class="dateline"><i class="i i-clock-light-grey relative-timestamp__icon"></i><time datetime="' + datePublished + '" class="js-timestamp"></time></div>';
        }
        if (title === 'Wikipedia') {
            contentFragment = '<div class="card__description type-11">' + description + '</div>';
        } else {
            contentFragment = '<h3 class="card__headline">' + headline + '</h3>';
        }
        if (host && !/^theguardian\.com$/.test(host)) {
            contentFragment += '<div class="card__appendix type-12">' + host + '</div>';
        }

        tpl =   '<div class="card-wrapper">' +
                    '<div class="furniture furniture--left card card--left">' +
                        '<a class="card__action" href="' + href + '" data-link-name="in card link" aria-hidden="true">' +
                            imageFragment +
                            '<div class="card__body u-text-hyphenate">' +
                                contentFragment +
                            '</div>' +
                        '</a>' +
                        '<div class="card__meta">' +
                            publishedFragment +
                        '</div>' +
                    '</div>' +
                '</div>';

        self.$linkContext.before(tpl);
        mediator.emit('fragment:ready:dates');
    };

    function stripHost(url) {
        return url.replace("http://" + document.location.host, "");
    }

    InlineLinkCard.prototype.fetchData = function() {
        var href = stripHost(this.link.getAttribute('href')), // Trim because some href attributes contain spaces
            self = this,
            reqURL;
        if ((/^\//).test(href)) {
            reqURL = '/cards/opengraph/' + encodeURIComponent('http://www.theguardian.com' + href) + '.json';
        } else if ((/^http(?:s)?:\/\//).test(href)) {
            reqURL = '/cards/opengraph/' + encodeURIComponent(href) + '.json';
        }

        // make request to endpoint
        ajax({
            url: reqURL,
            type: 'json',
            crossOrigin: true
        }).then(
            function(resp) {
                self.prependCard(href, resp, self.title);
            },
            function(req) {
                mediator.emit('module:error', 'Failed to cardify in body link: ' + req.statusText, 'modules/inline-link-card.js');
            }
        );
    };

    return InlineLinkCard;

});
