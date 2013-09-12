define([
    'common',
    'modules/detect',
    'ajax',
    'bonzo'
], function (
    common,
    detect,
    ajax,
    bonzo
) {

    function RightHandCard(options) {
        this.options = common.extend(this.DEFAULTS, options);
        this.type = this.options.type;
        this.$el = bonzo(document.querySelector(this.options.cls));
        if(typeof this.options.supportedTypes[this.type] !== 'undefined') {
            this.loadCard();
        }
    }

    RightHandCard.prototype.DEFAULTS = {
        cls: '.card-wrapper--right',
        context: document,
        supportedTypes: {
            'story-package' : false,
            'most-read'     : '/most-read/card.json',
            'latest'        : '/recent/card.json'
        }
    };

    RightHandCard.prototype.loadCard = function() {
        var self = this,
            layoutMode = detect.getLayoutMode();

        if (layoutMode !== 'mobile' && layoutMode !== 'tablet') {
            if(this.type !== 'story-package') {
                this.fetchData();
            }
            this.dedupe();
            this.$el.removeClass('is-hidden');

            common.mediator.emit('fragment:ready:dates');
        }
    };

    RightHandCard.prototype.dedupe = function() {
        var headline = this.$el[0].querySelector('.card__headline').innerHTML;
        common.toArray(this.options.context.querySelectorAll('.trail')).forEach(function(el){
            if(el.querySelector('.trail__headline a').innerHTML.trim() === headline) {
                el.parentNode.removeChild(el);
            }
        });
    };

    RightHandCard.prototype.replaceCard = function(html) {
        this.$el.replaceWith(html);
        this.$el = bonzo(document.querySelector(this.options.cls));
    };

    RightHandCard.prototype.fetchData = function() {
        var self = this;
        ajax({
            url: this.options.supportedTypes[this.type],
            type: 'json',
            crossOrigin: true
        }).then(
            function(resp) {
                if(resp && "html" in resp) {
                    self.replaceCard.call(self, resp.html);
                }
            },
            function(req) {
                common.mediator.emit('module:error', 'Failed to load right hand card: ' + req.statusText, 'modules/inline-link-card.js');
            }
        );
    };

    return RightHandCard;

});
