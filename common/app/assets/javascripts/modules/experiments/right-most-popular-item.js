/*
 Module: RightMostPopularItem.js
 Description: Item for right most popular panel
 */
define([
    'modules/component',
    'bonzo'
], function (
    Component,
    bonzo
    ) {

    function RightMostPopularItem(data) {
        this.data = data;
    }

    Component.define(RightMostPopularItem);

    RightMostPopularItem.prototype.templateName = 'right-most-popular-item';
    RightMostPopularItem.prototype.componentClass = 'right-most-popular-item';
    RightMostPopularItem.prototype.classes = {
        link: 'url',
        image: 'img',
        headline: 'headline' };
    RightMostPopularItem.prototype.useBem = true;

    RightMostPopularItem.prototype.template = '<li class="right-most-popular-item"><a class="right-most-popular-item__url media u-cf" href="">'
        + '<div class="right-most-popular-item__img media__img"><img class="responsive-img" src="" alt=""/></div>'
        + '<h3 class="right-most-popular-item__headline media__body">'
        + '</h3></a></li>';

    RightMostPopularItem.prototype.prerender = function() {
        if (this.data.itemPicture) {
            var container = this.getElem(this.classes.image);
            container.setAttribute("data-src", this.data.itemPicture);
            bonzo(container).addClass("item__image-container");
        }
        this.getElem(this.classes.link).href = this.data.url;
        this.getElem(this.classes.headline).innerHTML = this.data.headline;
    };

    return RightMostPopularItem;

});
