define([
    'underscore',
    'constants/defaults'
], function (
    _,
    CONST
) {
    var currentRes;

    var exports = {
        CONST: CONST,

        priority: (function (pathname) {
            var priority = pathname.match(/^\/?([^\/]+)/);
            if (priority && priority[1] !== 'editorial') {
                return priority[1];
            }
        })(window.location.pathname),

        model: null,
        setModel: function (currentModel) {
            exports.model = currentModel;
        },

        differs: function (res) {
            return _.isEqual(res, currentRes);
        },

        state: {
            config: {}
        },

        update: function (res) {
            currentRes = res;
            exports.state.config = res.config;
            if (exports.model) {
                exports.model.switches(res.switches);
            }
        },

        pageConfig: null,
        init: function (res) {
            currentRes = res;
            exports.pageConfig = res.defaults;

            CONST.types = res.defaults.dynamicContainers
                .concat(res.defaults.fixedContainers)
                .concat(CONST.extendDynamicContainers);

            CONST.typesDynamic = res.defaults.dynamicContainers;

            CONST.frontAgeAlertMs = {
                front:      60000 * 2 * (res.defaults.highFrequency || 1),
                editorial:  60000 * 2 * (res.defaults.standardFrequency || 5),
                commercial: 60000 * 2 * (res.defaults.lowFrequency || 60)
            };

            CONST.identity = {
                email: res.defaults.email,
                avatarUrl: res.defaults.avatarUrl
            };

            exports.update(res);
        }
    };

    return exports;
});
