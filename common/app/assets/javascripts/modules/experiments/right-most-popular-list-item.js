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

    function RightMostPopularItem(data, index) {
        this.index = index + 1;
        this.data = data;
    }

    Component.define(RightMostPopularItem);

    RightMostPopularItem.prototype.templateName = 'right-most-popular-item';
    RightMostPopularItem.prototype.componentClass = 'right-most-popular-item';
    RightMostPopularItem.prototype.classes = {
        link: 'url',
        count: 'count',
        headline: 'headline' };
    RightMostPopularItem.prototype.useBem = true;

    RightMostPopularItem.prototype.template = '<li class="right-most-popular-item"><a class="right-most-popular-item__url media u-cf" href="">'
        + '<div class="right-most-popular-item__count-container media__img"><span class="right-most-popular-item__count"></span></div>'
        + '<h3 class="right-most-popular-item__headline media__body"></h3></a></li>';

    RightMostPopularItem.prototype.prerender = function() {
        this.getElem(this.classes.count).innerHTML =  this.index;
        this.getElem(this.classes.link).href = this.data.url;
        this.getElem(this.classes.headline).innerHTML = this.data.headline;
        this.elem.setAttribute('data-link-name', 'trail | ' + this.index);
    };

    return RightMostPopularItem;

});
