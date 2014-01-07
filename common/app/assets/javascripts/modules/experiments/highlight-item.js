/*
 Module: highlights-intem.js
 Description: Item for hightlight panel
 */
define([
    'common/modules/component',
    'bonzo'
], function (
    Component,
    bonzo
    ) {

    function Highlight(data, index) {
        this.data = data;
        this.index = index;
    }

    Component.define(Highlight);

    Highlight.prototype.templateName = 'highlight-item';
    Highlight.prototype.componentClass = 'highlight-item';
    Highlight.prototype.classes = {
            link: 'url',
            image: 'img',
            headline: 'headline' };
    Highlight.prototype.useBem = true;

    Highlight.prototype.template = '<li class="highlight-item"><a class="highlight-item__url media" href="">'
        + '<div class="highlight-item__img media__img"><img class="responsive-img" src="" alt=""/></div>'
        + '<h3 class="highlight-item__headline media__body">'
        + '</h3></a></li>';

    Highlight.prototype.prerender = function() {
        if (this.data.itemPicture) {
            var container = this.getElem(this.classes.image);
            container.setAttribute("data-src", this.data.itemPicture);
            bonzo(container).addClass("item__image-container");
        }
        this.getElem(this.classes.link).href = this.data.url;
        this.getElem(this.classes.link).setAttribute("data-link-name", "highlight item " + this.index);
        this.getElem(this.classes.headline).innerHTML = this.data.headline;
    };

    return Highlight;

});
