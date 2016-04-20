define([
    'common/modules/commercial/creatives/expandable-v2',
    'lodash/objects/merge'
], function (
    ExpandableV2
) {
    function FabricExpandingV1($adSlot, params) {
        var self = new ExpandableV2($adSlot, params);
        self.closedHeight = 250;
        self.openedHeight = 500;

        return self;
    }

    return FabricExpandingV1;
});
