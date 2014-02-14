/**
 * Created with IntelliJ IDEA.
 * User: nbennett
 * Date: 14/02/14
 * Time: 10:55
 * To change this template use File | Settings | File Templates.
 */
define([
    'common/modules/component'
], function( 
    Component        
) {
 
    function RightOutbrainRecommendation(data, index) {
        this.index = index + 1;
        this.data = data;
    }

    Component.define(RightOutbrainRecommendation);

    RightOutbrainRecommendation.prototype.templateName = 'right-recommended-item';
    RightOutbrainRecommendation.prototype.componentClass = 'right-recommended-item';
    RightOutbrainRecommendation.prototype.classes = {
        link: 'url',
        image: 'img',
        headline: 'headline'
    };
    RightOutbrainRecommendation.prototype.useBem = true;
    RightOutbrainRecommendation.prototype.showComments = false;

    RightOutbrainRecommendation.prototype.template = '<li class="right-recommended-item"><a class="right-recommended-item__url media u-cf" href="">'
        + '<div class="right-recommended-item__img media__img js-image-upgrade"><img class="responsive-img" src="" alt=""/></div>'
        + '<h3 class="right-recommended-item__headline media__body">'
        + '</h3></a></li>';

    RightOutbrainRecommendation.prototype.prerender = function() {
        console.log("++ So fuckin what");
        if( this.data.thumbnail ) {
            console.log("Image: " + this.data.thumbnail.url + "Url: " + this.data.url + " f: " + this.data.content);
            var container = this.getElem(this.classes.image);
            container.setAttribute("data-src", this.data.thumbnail.url);
        }
        this.elem.setAttribute('data-link-name', 'trail | ' + this.index );
        this.getElem(this.classes.link).href = this.data.url;
        this.getElem(this.classes.headline).innerHTML = this.data.content;
    };
    
    return RightOutbrainRecommendation;
});
