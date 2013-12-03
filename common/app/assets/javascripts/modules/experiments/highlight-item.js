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
            link: 'url',
            image: 'img',
            headline: 'headline'
        },
        useBem: true
    };

    Highlight.prototype.template = '<li class="highlight-item"><a class="highlight-item__url media" href="">'
        + '<img class="highlight-item__img media__img" src="" alt=""/><h3 class="highlight-item__headline media__body">'
        + '</h3></a></li>';

    Highlight.prototype.prerender = function() {
        if(this.data.itemPicture) { this.getElem(this.conf().classes.image).src = this.data.itemPicture; }
        this.getElem(this.conf().classes.link).href = this.data.url;
        this.getElem(this.conf().classes.headline).innerHTML = this.data.headline;
    };

    return Highlight;

});
