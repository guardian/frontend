/*
    Module: inline-link-card.js
    Description: Load in data from the linked page and display in sidebar
*/
define([
    'common',
    'modules/detect',
    'ajax',
    'bean'
], function (
    common,
    detect,
    ajax,
    bean
) {
    /**
     * @param {DOMElement} link        The link to transform
     * @param {DOMElement} linkContext Where the card should be inserted
     * @param {String}     title       Give a heading to the card
     */
    function InlineLinkCard(link, linkContext, title) {
        this.link = link;
        this.title = title || false;
        this.$linkContext = common.$g(linkContext);
    }

    InlineLinkCard.prototype.init = function() {
        var self = this;
        self.loadCard();

        bean.on(window, 'resize', common.debounce(function(e){
            self.loadCard();
        }, 200));
    };

    InlineLinkCard.prototype.loadCard = function() {
        var layoutMode = detect.getLayoutMode();

        if (layoutMode === 'extended' && !this.link.getAttribute('data-hasbeencardified')) {
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
            tpl,
            imageFragment = '',
            titleFragment = '',
            publishedFragment = '',
            contentFragment = '';

        if (!headline) {
            return false;
        }

        if (title) {
            titleFragment = '<h2 class="card__title">' + title + '</h2>';
        }
        if (image) {
            imageFragment = '<img src="' + image + '" alt="" class="card__media" />';
        }
        if (datePublished) {
            publishedFragment = '<div class="dateline"><i class="i i-date relative-timestamp__icon"></i><time datetime="' + datePublished + '" class="js-timestamp"></time></div>';
        }
        if (title === 'Wikipedia') {
            contentFragment = '<div class="card__description type-11">' + description + '</div>';
        } else {
            contentFragment = '<h3 class="card__headline">' + headline + '</h3>';
        }

        tpl = '<a href="' + href + '" class="card-wrapper" data-link-name="in card link" aria-hidden="true">' +
                  '<div class="furniture furniture--left card">' +
                      titleFragment +
                      imageFragment +
                      '<div class="card__body u-text-hyphenate">' +
                          publishedFragment +
                          contentFragment +
                      '</div>' +
                  '</div>' +
              '</a>';

        self.$linkContext.before(tpl);
        common.mediator.emit('fragment:ready:dates');
    };

    InlineLinkCard.prototype.fetchData = function() {
        var href = this.link.getAttribute('href').trim(), // Trim because some href attributes contain spaces
            self = this,
            reqURL;
        if ((/^\//).test(href)) {
            reqURL = '/cards/opengraph/' + encodeURIComponent('http://www.theguardian.com' + href);
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
                common.mediator.emit('module:error', 'Failed to cardify in body link: ' + req.statusText, 'modules/inline-link-card.js');
            }
        );
    };

    return InlineLinkCard;

});
