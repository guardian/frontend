define([
    'common/utils/_'
], function (
    _
) {

    // Update default settings
    _.merge(_.templateSettings, {
        // Normally evaluate and interpolate at the other way round
        evaluate:    /{{=([\s\S]+?)}}/g,
        interpolate: /{{([\s\S]+?)}}/g,
        escape:      /{{-([\s\S]+?)}}/g
    });

    return _.template.bind(_);

});
