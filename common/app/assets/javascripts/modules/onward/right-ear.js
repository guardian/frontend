define([
    'bean',
    'bonzo',
    'modules/component'
], function(
    bean,
    bonzo,
    Component
) {

function RightEar(sequence, mediator, options) {
    this.context = document;
    this.mediator = mediator;
    this.sequence = sequence;
    this.setOptions(options);
}

Component.define(RightEar);

RightEar.CONFIG = {
    templateName: 'right-ear',
    componentClass: 'd-right-ear',
    useBem: true
};

RightEar.prototype.defaultOptions = {};

RightEar.prototype.errors = [];

RightEar.prototype.ready = function() {
    bean.on(this.elem, 'mouseenter', this.setExpanded.bind(this));
    bean.on(this.elem, 'mouseleave', this.setContracted.bind(this));
    bean.on(this.elem, 'webkitAnimationStart', this.onAnimationStart.bind(this));
};

RightEar.prototype.prerender = function() {
    // Update the headline here.
};

RightEar.prototype.setExpanded = function(e) {
    this.setState('expanded');
};

RightEar.prototype.setContracted = function(e) {
    if (this.hasState('expanded')) {
        this.removeState('expanded');
    }
};

RightEar.prototype.onAnimationStart = function(e) {
    window.console.log("anim  started.");
};

return RightEar;

}); // define