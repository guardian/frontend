/*
 Module: RightMostPopularItem.js
 Description: Item for right most popular panel
 */
define([
    'common/modules/component'
], function (
    Component
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
        image: 'img',
        headline: 'headline' };
    RightMostPopularItem.prototype.useBem = true;
    RightMostPopularItem.prototype.showComments = false;

    RightMostPopularItem.prototype.template = '<li class="right-most-popular-item"><a class="right-most-popular-item__url media u-cf" href="">'
        + '<div class="right-most-popular-item__img media__img js-image-upgrade"><img class="responsive-img" src="" alt=""/></div>'
        + '<h3 class="right-most-popular-item__headline media__body">'
        + '</h3></a></li>';

    RightMostPopularItem.prototype.prerender = function() {
        if (this.data.itemPicture) {
            var container = this.getElem(this.classes.image);
            container.setAttribute("data-src", this.data.itemPicture);
        }
        if(this.data.discussionId && this.showComments) {
            this.elem.setAttribute("data-discussion-id", this.data.discussionId);
        }
        this.elem.setAttribute('data-link-name', 'trail | ' + this.index);
        this.getElem(this.classes.link).href = this.data.url;
        this.getElem(this.classes.headline).innerHTML = this.data.headline;
    };

    return RightMostPopularItem;

});
