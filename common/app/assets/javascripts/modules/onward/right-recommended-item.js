define([
    'common/modules/component',
    'common/common',
    'bonzo',
    'bean'
], function (
    Component,
    common,
    bonzo,
    bean
    ) {

    var that = this;

    function RightGravityRecommendation(data, index, context) {
       this.context = context;
       this.index = index + 1;
       this.data = data;
    }

    Component.define(RightGravityRecommendation);

    RightGravityRecommendation.prototype.templateName = 'right-recommended-item';
    RightGravityRecommendation.prototype.componentClass = 'right-recommended-item';
    RightGravityRecommendation.prototype.classes = {
        link: 'url',
        image: 'img',
        headline: 'headline'
    };
    RightGravityRecommendation.prototype.useBem = true;
    RightGravityRecommendation.prototype.showComments = false;

    RightGravityRecommendation.prototype.template = '<li class="right-recommended-item"><a class="right-recommended-item__url media u-cf" href="">'
        + '<div class="right-recommended-item__img media__img js-image-upgrade"></div>'
        + '<h3 class="right-recommended-item__headline media__body">'
        + '</h3></a></li>';

    RightGravityRecommendation.prototype.prerender = function() {
        if( this.data.image ) {
            var container = this.getElem(this.classes.image);
            container.setAttribute("data-src", this.data.image);
        }
        this.elem.setAttribute('data-link-name', 'trail | ' + this.index );
        this.getElem(this.classes.link).href = this.data.url;
        this.getElem(this.classes.headline).innerHTML = this.data.title;
    };

    return RightGravityRecommendation;
});
