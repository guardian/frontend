define(["bean",
        "common",
        "bonzo"],
    function (
        bean,
        common,
        bonzo) {

    function Overlay(content) {
        content = content || '<div class="preload-msg"><div class="is-updating"></div></div>';

        var self     = this,
            template = '<div class="overlay">' +
                       '  <div class="overlay__header cf">' +
                       '    <div class="overlay__toolbar cf"></div>' +
                       '    <button class="overlay__cta overlay__cta--close  js-overlay-close" data-link-name="Close overlay">' +
                       '      <i class="i i-close-icon"></i>' +
                       '    </button>' +
                       '  </div>' +
                       '  <div class="overlay__body">' + content + '</div>' +
                       '</div>';

        bonzo(document.body).append(template);

        this._savedPos   = 0,
        this.node        = document.body.querySelector('.overlay');
        this.headerNode  = this.node.querySelector('.overlay__header');
        this.toolbarNode = this.node.querySelector('.overlay__toolbar');
        this.bodyNode    = this.node.querySelector('.overlay__body');

        this.node.style.display = 'none';
        this.node.style.minHeight = document.height+'px';

        // Setup events
        bean.on(this.node, 'click', '.js-overlay-close', function(e) {
            e.preventDefault();
            self.hide();
            common.mediator.emit('modules:overlay:close', self);
        });

    }

    Overlay.prototype.show = function() {
        this.node.style.display = 'block';

        // Can't reliably use position:fixed on mobile. This works around it (well, it tries)
        this._savedPos = window.pageYOffset;
        window.scrollTo(window.pageXOffset, 0);

        common.mediator.emit('modules:overlay:show', this);
    };

    Overlay.prototype.hide = function() {
        window.scrollTo(window.pageXOffset, this._savedPos); // Restore previous scroll pos

        this.node.style.display = 'none';
        common.mediator.emit('modules:overlay:hide', this);
    };

    Overlay.prototype.setBody = function(content) {
        this.bodyNode.innerHTML = content;
    };

    Overlay.prototype.remove = function() {
        this.node.parentNode.removeChild(this.node);
    };

    return Overlay;
});