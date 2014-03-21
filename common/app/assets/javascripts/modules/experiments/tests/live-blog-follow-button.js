define([], function() {

    var LiveBlogFollowButton = function(){

        this.id = 'LiveBlogFollowButton';
        this.expiry = '2015-03-28';
        this.audience = 0.2;
        this.audienceOffset = 0.2;
        this.description = 'Let 10% of users see the follow button on live blogs';
        this.canRun = function(){
            return true;
        };
        this.variants = [
            {
                id: 'control',
                test: function() {
                    return true;
                }
            },
            {
                id: 'show-button',
                test: function() {
                   document.getElementsByClassName('follow-btn')[0].style.visibility='visible';
                }
            }
        ];
    };
    return LiveBlogFollowButton;
});