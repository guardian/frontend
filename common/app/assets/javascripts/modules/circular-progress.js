define(["bean",
        "common",
        "bonzo"],
    function (
        bean,
        common,
        bonzo) {

    function CircularProgress(opts) {
        this.$el = bonzo(opts.el);

        var baseColour = opts.baseColour || '#cccccc',
            activeColour = opts.activeColour || '#ec1c1c',
            bgColour = opts.bgColour || '#f4f4ee',
            arcWidth = opts.arcWidth || 3,
            width    = this.$el.dim().width,
            radius   = (width - arcWidth) / 2,
            centre   = width / 2,
            template = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">' +
                       '  <circle cx="'+centre+'" cy="'+centre+'" r="'+radius+'"'+' stroke="'+baseColour+'"' +
                       '     stroke-width="'+arcWidth+'" fill="transparent"></circle>' +
                       '  <path fill="transparent" stroke="'+activeColour+'" stroke-width="'+arcWidth+'"></path>' +
                       '  <circle cx="'+centre+'" cy="'+centre+'" r="'+(radius - arcWidth/2)+'" fill="'+bgColour+'"></circle>' +
                       '</svg>' +
                       '<span class="counter"></span>';


        this.$el.html(template);

        this.centre = width / 2;
        this.radius = (width - arcWidth) / 2;

        this.pathEl = opts.el.querySelector('path');
        this.pathEl.setAttribute('transform', 'translate(' + this.centre + ', ' + this.centre + ')');

        this.labelEl = opts.el.querySelector('.counter');
    }

    CircularProgress.prototype.render = function(label, percent) {
        // Based on http://stackoverflow.com/questions/5230148/create-svg-progress-circle
        var angle    = percent * 3.5999, // percent to angle
            rad      = angle * (Math.PI / 180), // to radians
            x        = this.radius * Math.sin(rad),
            y        = -this.radius * Math.cos(rad),
            largeArc = (angle > 180) ? 1 : 0, // use large Arc switch when past 180
            pathStr  = [
                          'M', 0, 0,
                          'v', -this.radius,
                          'A', this.radius, this.radius, 1,
                          largeArc, 1,
                          x, y
                       ];

        if (!percent) { pathStr = ['M', 0, 0] }; // Ensure there's no artifacts when at 0
        this.pathEl.setAttribute('d', pathStr.join(' '));
        this.labelEl.innerHTML = label;
    };

    return CircularProgress;
});