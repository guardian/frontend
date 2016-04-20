define([
    'common/modules/commercial/creatives/fluid250',
    'lodash/objects/merge'
], function (
    Fluid250,
    merge
) {
    function FabricV1($adSlot, params) {
        var viewModel = merge(params, {
            creativeHeight : 'fixed'
        });
        return new Fluid250($adSlot, viewModel);
    }

    return FabricV1;
});
