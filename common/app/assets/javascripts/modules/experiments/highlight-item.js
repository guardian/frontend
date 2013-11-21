/*
 Module: highlights-intem.js
 Description: Item for hightlight panel
 */
define([
    'modules/component'
], function (
    Component
    ) {

    function Highlight(data) {
        this.data = data;
    }

    Component.define(Highlight);

    Highlight.CONFIG = {
        templateName: 'highlight-item',
        componentClass: 'highlight-item',
        classes: {
            image: 'img',
            headline: 'headline'
        },
        useBem: true
    };

    Highlight.prototype.prerender = function() {
        if(this.data.itemPicture) { this.getElem(this.conf().classes.image).src = this.data.itemPicture; }
        this.getElem(this.conf().classes.headline).href = this.data.url;
        this.getElem(this.conf().classes.headline).innerHTML = this.data.headline;
    };

    return Highlight;

});
