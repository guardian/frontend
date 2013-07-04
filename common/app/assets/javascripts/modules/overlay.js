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
            savedPos = 0,
            bodyNode = common.$g('body'),
            template = '<div class="overlay">' +
                       '  <div class="overlay__header cf">' +
                       '    <div class="overlay__toolbar cf"></div>' +
                       '    <button class="overlay__cta overlay__cta--close  js-overlay-close" data-link-name="Close overlay">' +
                       '      <i class="i i-close-icon"></i>' +
                       '    </button>' +
                       '  </div>' +
                       '  <div class="overlay__body">' + content + '</div>' +
                       '</div>';

        bodyNode.append(template);

        this.node        = bodyNode[0].querySelector('.overlay');
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


        this.show = function() {
            self.node.style.display = 'block';

            // Can't reliably use position:fixed on mobile. This works around it (well, it tries)
            savedPos = window.pageYOffset;
            window.scrollTo(window.pageXOffset, 0);

            common.mediator.emit('modules:overlay:show', self);
        };

        this.hide = function() {
            window.scrollTo(window.pageXOffset, savedPos); // Restore previous scroll pos

            self.node.style.display = 'none';
            common.mediator.emit('modules:overlay:hide', self);
        };

        this.setBody = function(content) {
            self.bodyNode.innerHTML = content;
        };

        this.remove = function() {
            self.node.parentNode.removeChild(self.node);
        };
    }

    return Overlay;
});