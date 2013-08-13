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
            headline = data.headline || false,
            thumbnail = data.thumbnail,
            tpl,
            thumbnailFragment = '',
            titleFragment = '';

        if (!headline) {
            return false;
        }

        if (title) {
            titleFragment = '<h2 class="card__title">' + title + '</h2>';
        }
        if (thumbnail) {
            thumbnailFragment = '<img src="' + thumbnail + '" alt="" class="card__media" />';
        }

        tpl = '<a href="' + href + '" class="card-wrapper" data-link-name="in card link" aria-hidden="true">' +
                  '<div class="furniture furniture--left card">' +
                      titleFragment +
                      thumbnailFragment +
                      '<div class="card__body u-text-hyphenate"><h3 class="card__headline">' + headline + '</h3></div>' +
                  '</div>' +
              '</a>';

        self.$linkContext.before(tpl);
    };

    InlineLinkCard.prototype.fetchData = function() {
        var href = this.link.getAttribute('href'),
            self = this;

        // make request to endpoint
        ajax({
            url: href + '.json',
            type: 'json',
            crossOrigin: true
        }).then(
            function(resp) {
                self.prependCard(href, resp.config.page, self.title);
            },
            function(req) {
                common.mediator.emit('module:error', 'Failed to cardify in body link: ' + req.statusText, 'modules/inline-link-card.js');
            }
        );
    };

    return InlineLinkCard;

});
