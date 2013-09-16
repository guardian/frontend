define(["bean",
        "common",
        "bonzo"],
    function (
        bean,
        common,
        bonzo) {

    function CircularProgress(opts) {
        this.$el = bonzo(opts.el);

        var self     = this,
            baseColour = opts.baseColour || '#cccccc',
            activeColour = opts.activeColour || '#cc0000',
            arcWidth = opts.arcWidth || 8,
            radius   = this.$el.dim().width / 2;
            template = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">' +
                         '<circle cx="'+radius+'" cy="'+radius+'" r="'+radius+'"'+' fill="'+baseColour+'"></circle>' +
                         '<path d="M50,50 " fill="none" stroke="'+activeColour+'" stroke-width="'+arcWidth+'">' +
                         '<circle cx="'+radius+'" cy="'+radius+'" r="'+(radius - width)+'" fill="#FFFFFF"></circle>' +
                        '</svg>';


    }

    CircularProgress.prototype.setProgress = function(percent) {

    };


    CircularProgress.prototype.setProgress = function(percent) {

    };

    return CircularProgress;
});