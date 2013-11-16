define(["bean",
        "common",
        "bonzo",
        "utils/detect"],
    function (
        bean,
        common,
        bonzo,
        detect) {

    function CircularProgress(opts) {
        this.$el = bonzo(opts.el);

        var baseColour = opts.baseColour || '#cccccc',
            activeColour = opts.activeColour || '#ec1c1c',
            bgColour = opts.bgColour || '#f4f4ee',
            arcWidth = opts.arcWidth || 3,
            width    = opts.size || this.$el.dim().width,
            radius   = (width - arcWidth) / 2,
            centre   = width / 2,
            template = '<div class="circular-progress">' +
                       '  <svg xmlns="http://www.w3.org/2000/svg" version="1.1">' +
                       '    <circle cx="'+centre+'" cy="'+centre+'" r="'+radius+'"'+' stroke="'+baseColour+'"' +
                       '       stroke-width="'+arcWidth+'" fill="transparent"></circle>' +
                       '    <path fill="transparent" stroke="'+activeColour+'" stroke-width="'+arcWidth+'"></path>' +
                       '    <circle cx="'+centre+'" cy="'+centre+'" r="'+(radius - arcWidth/2)+'" fill="'+bgColour+'"></circle>' +
                       '  </svg>' +
                       '  <span class="circular-progress__counter"></span>' +
                       '  <span class="circular-progress__cta i"></span>' +
                       '</div>';

        this.$el.html(template);
        this.$el = bonzo(opts.el.querySelector('.circular-progress'));

        this.centre = width / 2;
        this.radius = (width - arcWidth) / 2;

        this.pathEl = opts.el.querySelector('path');
        this.pathEl.setAttribute('transform', 'translate(' + this.centre + ', ' + this.centre + ')');

        this.labelEl = opts.el.querySelector('.circular-progress__counter');

        // Using this as a hook to disable hover styles on touch (thanks Safari!)
        if (!detect.hasTouchScreen()) {
            this.$el.addClass('circular-progress--no-touch');
        }
    }

    CircularProgress.prototype.enable = function() {
        this.$el.addClass('circular-progress--is-on')
                .removeClass('circular-progress--is-off');
        return this;
    };

    CircularProgress.prototype.disable = function() {
        this.$el.addClass('circular-progress--is-off')
                .removeClass('circular-progress--is-on');
        this.render('', 0);
        return this;
    };

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

        if (!percent) {
            // Ensure there's no artifacts when at 0
            pathStr = ['M', 0, 0];
        }

        this.pathEl.setAttribute('d', pathStr.join(' '));
        this.labelEl.innerHTML = label;
        return this;
    };

    return CircularProgress;
});
