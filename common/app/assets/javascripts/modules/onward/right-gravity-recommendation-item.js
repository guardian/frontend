/*
  Module: RightGravityRecommendation.js
  Description: I've ripped off the most-popular-image-iten Item for right next read next panel - as recommended by gravity. Allegedly
*/

define([
    'common/modules/component'
], function (
    Component
    ) {

    function RightGravityRecommendation(data, index) {
       this.index = index + 1;
       this.data = data;
    }

    Component.define(RightGravityRecommendation);

    RightGravityRecommendation.prototype.templateName = 'right-gravity-recommendation-item';
    RightGravityRecommendation.prototype.componentClass = 'right-gravity-recommendation-item';
    RightGravityRecommendation.classes = {
        link: 'url',                                //These might have to change, but I don't think so
        image: 'img',
        headline: 'headLine'
    };
    RightGravityRecommendation.prototype.useBem = true;
    RightGravityRecommendation.prototype.showComments = false; //Blat??

    RightGravityRecommendation.prototype.template = '<li class="right-most-popular-item"><a class="right-most-popular-item__url media u-cf" href="">'
        + '<div class="right-most-popular-item__img media__img js-image-upgrade"><img class="responsive-img" src="" alt=""/></div>'
        + '<h3 class="right-most-popular-item__headline media__body">'
        + '</h3></a></li>';

    RightGravityRecommendation.prototype.prerender = function() {
        if( this.data.image ) {
            var container = this.getElem(this.classes.image);
            container.setAttribute("data-src", this.data.image);
        }
        this.elem.setAttribute('data-link-name', 'trail | ' + this.index );
        this.getElem(this.classes.link).href = this.data.url;
        this.getElem(this.classes.headLine).innerHTML = this.data.title;
    };

    return RightGravityRecommendation;
});
