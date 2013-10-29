define(['common', 'modules/id'], function(common, Id) {
    function Track() {}

    Track.prototype.comment = function() {
        s.events = 'event51';
        s.eVar66 = Id.getUserFromCookie().id;
        s.eVar68 = 'comment';
        s.linkTrackVars = 'events,prop51,eVar51,eVar7,eVar66,eVar67,eVar68,prop19';
        s.linkTrackEvents = 'event51';
        s.tl(true, 'o', 'comment');
    };

    Track.prototype.recommend = function(e) {
        s.events = 'event72';
        s.eVar65 = 'recommendation';
        s.eVar66 = Id.getUserFromCookie().id;
        s.eVar67 = e.userId;
        s.linkTrackVars = 'events,prop51,eVar51,eVar7,eVar65,eVar66,eVar67,prop19';
        s.linkTrackEvents = 'event72';
        s.tl(true, 'o', 'Recommend a comment');
    };


    var init = function() {
        var track = new Track();
        common.mediator.on('discussion:commentbox:post:success', track.comment);
        common.mediator.on('discussion:comment:recommend:success', track.recommend);
    };

    return { init: init };
}); // define