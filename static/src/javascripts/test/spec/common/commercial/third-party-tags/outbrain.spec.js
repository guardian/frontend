import sut from 'common/modules/commercial/third-party-tags/outbrain';
import mediator from 'common/utils/mediator';

describe('Outbrain', function () {

    it('should exist', function () {
        expect(sut).toBeDefined();
    });

    it('should listen for dfp render event', function () {
    	spyOn(sut, 'load');

    	var event = {
    		slot: {
    			getSlotId: function () {
    				return {
    					getDomId: function () {
    						return ''
    					}
    				}
    			}
    		},
    		isEmpty: true
    	};

    	sut.init();
    	mediator.emit('modules:commercial:dfp:rendered', event);

    	expect(sut.load).toHaveBeenCalled();
    });
});
