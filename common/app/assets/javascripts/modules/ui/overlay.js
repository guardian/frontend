define([
    'bean',
    'common/utils/mediator',
    'bonzo'
], function (
    bean,
    mediator,
    bonzo
) {

    function Overlay(content) {
        this.loadingHtml = '<div class="preload-msg"><div class="is-updating is-updating--dark"></div></div>';
        content = content || this.loadingHtml;

        var self     = this,
            template = '<div class="overlay">' +
                       '  <div class="overlay__header u-cf">' +
                       '    <div class="overlay__toolbar u-cf"></div>' +
                       '    <button class="overlay__cta overlay__cta--close js-overlay-close" data-link-name="Close overlay">' +
                       '      <i class="i i-close-icon-white"></i>' +
                       '    </button>' +
                       '  </div>' +
                       '  <div class="overlay__body">' + content + '</div>' +
                       '</div>';

        bonzo(document.body).append(template);

        this._savedPos   = 0;
        this.node        = document.body.querySelector('.overlay');
        this.headerNode  = this.node.querySelector('.overlay__header');
        this.toolbarNode = this.node.querySelector('.overlay__toolbar');
        this.bodyNode    = this.node.querySelector('.overlay__body');

        this.node.style.display = 'none';

        // Setup events
        bean.on(this.node, 'click', '.js-overlay-close', function(e) {
            e.preventDefault();
            self.hide();
            mediator.emit('modules:overlay:close', self);
        });

    }

    Overlay.prototype.showLoading = function() {
        this.setBody(this.loadingHtml);
        this.show();
    };

    Overlay.prototype.show = function() {
        // Can't reliably use position:fixed on mobile. This works around it (well, it tries)
        this._savedPos = window.pageYOffset;

        bonzo(document.body).addClass('has-overlay');
        this.node.style.display = 'block';

        window.scrollTo(window.pageXOffset, 0);

        mediator.emit('modules:overlay:show', this);
    };

    Overlay.prototype.hide = function() {
        var self = this;
        bonzo(document.body).removeClass('has-overlay');

        // Restore previous scroll pos
        var scrollDelay = 0;
        setTimeout(function() {
            window.scrollTo(window.pageXOffset, self._savedPos);
        }, scrollDelay);


        this.node.style.display = 'none';
        mediator.emit('modules:overlay:hide', this);
        mediator.emit('window:resize'); // trigger responsive image upgrade
    };

    Overlay.prototype.setBody = function(content) {
        this.bodyNode.innerHTML = content;
    };

    Overlay.prototype.remove = function() {
        if (this.node.parentNode) {
            this.node.parentNode.removeChild(this.node);
        }
    };

    return Overlay;
});
