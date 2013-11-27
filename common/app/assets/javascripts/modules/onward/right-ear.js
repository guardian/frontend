define([
    'bean',
    'bonzo',
    'modules/component'
], function(
    bean,
    bonzo,
    Component
) {

function RightEar(sequence, options) {
    this.context = document;
    this.sequenceItem = sequence[0];
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
};

RightEar.prototype.prerender = function() {
    // Update the headline.
    bonzo(this.getElem('headline')).text(this.sequenceItem.headline);
    this.getElem('link').href = this.sequenceItem.url;
};

RightEar.prototype.setExpanded = function(e) {
    this.setState('expanded');
};

RightEar.prototype.setContracted = function(e) {
    if (this.hasState('expanded')) {
        this.removeState('expanded');
    }
};

return RightEar;

}); // define