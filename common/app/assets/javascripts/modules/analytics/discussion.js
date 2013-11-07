define(['common', 'modules/id'], function(common, Id) {
    /**
     * event51: Comment
     * event72: Engagement event (e.g. recommendation)
     * eVar65: Only for event72. Type of interaction (any string)
     * eVar66: User ID of current user
     * eVar67: User ID of person being acted upon
     * eVar68: Only for event51. comment || response
     */
    function Track() {}

    /**
     * @param {Array.<string>}
     * @return {string}
     */
    Track.prototype.getLinkTrackVars = function(extras) {
        extras = extras || [];
        var linkTrackVars = [
            'events',
            'prop4', 'prop6', 'prop8', 'prop10', 'prop13',
            'prop19', 'prop31', 'prop51', 'prop75',
            'eVar7', 'eVar8',  'eVar19', 'eVar31',
            'eVar51', 'eVar66'];

        return linkTrackVars.concat(extras).join(',');
    };

    Track.prototype.comment = function(comment) {
        s.events = 'event51';
        s.eVar66 = Id.getUserFromCookie().id || null;
        s.eVar68 = comment.replyTo ? 'response' : 'comment';
        s.eVar67 = comment.replyTo ? comment.replyTo.authorId : null;
        s.linkTrackVars = this.getLinkTrackVars(['eVar68']);
        s.linkTrackEvents = 'event51';
        s.tl(true, 'o', 'comment');
    };

    Track.prototype.recommend = function(e) {
        s.events = 'event72';
        s.eVar65 = 'recommendation';
        s.eVar66 = Id.getUserFromCookie() ? Id.getUserFromCookie().id : null;
        s.eVar67 = e.userId;
        s.linkTrackVars = this.getLinkTrackVars(['eVar65', 'eVar67']);
        s.linkTrackEvents = 'event72';
        s.tl(true, 'o', 'Recommend a comment');
    };


    var init = function() {
        var track = new Track();
        common.mediator.on('discussion:commentbox:post:success', track.comment.bind(track));
        common.mediator.on('discussion:comment:recommend:success', track.recommend.bind(track));
    };

    return { init: init };
}); // define
