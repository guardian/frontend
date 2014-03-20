/*
 Module: right-most-popular.js
 Description: Shows popular trails in the right column.
 */
define([
    'qwery',
    'common/utils/ajax',
    'lodash/objects/assign',

    'common/modules/analytics/register',
    'common/modules/component'
], function (
    qwery,
    ajax,
    extend,

    register,
    Component
    ) {

    function RightMostPopular(mediator, config) {
        register.begin('right-most-popular');
        this.config = extend(this.config, config);
        this.mediator = mediator;
        this.fetch(qwery('.mpu-context'), 'rightHtml');
    }

    Component.define(RightMostPopular);

    RightMostPopular.prototype.endpoint = '/most-read.json';

    RightMostPopular.prototype.ready = function() {
        register.end('right-most-popular');
    };

    return RightMostPopular;

});