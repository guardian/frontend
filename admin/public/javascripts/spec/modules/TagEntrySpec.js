define(["tagEntry", 'Common'], function(tagEntry, common) {

    describe("TagEntry", function() {

        var i
          , simulateKeyPress = function(str, target) {
                target.val(str);
                str.split("").forEach(function (c) {
                    var p = jQuery.Event("keyup")
                    p.which = c.charCodeAt()
                    target.trigger(p);
                })
            }

        beforeEach(function() {
            i = $('<input></input').attr('id', 'i').appendTo('body');
            tagEntry.init({ nodeList: i });

            spyOn(common.mediator, 'addListener');
            spyOn(common.mediator, 'emitEvent');
            jasmine.Clock.useMock();
        });

        afterEach(function() {
            i.remove();
        });

       it("should listen for keystrokes on a given input field", function () {
            simulateKeyPress('hello', i);
            console.log(common.mediator.emitEvent.mostRecentCall);
            expect(common.mediator.emitEvent.mostRecentCall.args[0]).toEqual('ui:autocomplete:keydown');
            expect(common.mediator.emitEvent.mostRecentCall.args[1].toString()).toBe('hello');
            jasmine.Clock.tick(701);
            expect(common.mediator.emitEvent.mostRecentCall.args[0]).toEqual('modules:oncomplete');
       });

       it("should ignore keystrokes shorter than 3 characters", function () {
            simulateKeyPress('he', i);
            jasmine.Clock.tick(701);
            expect(common.mediator.emitEvent.mostRecentCall.args[0]).toEqual('ui:autocomplete:keydown');
       });

       it("should ignore keystokes repeated in quick succession", function () {
            simulateKeyPress('hello', i); // five keystrokes made in 300ms
            jasmine.Clock.tick(300);
            expect(common.mediator.emitEvent.mostRecentCall.args[0]).toEqual('ui:autocomplete:keydown');
       });

       it("should broadcast when the tag entry input is changed", function () {
            i.trigger('change');
            expect(common.mediator.emitEvent.mostRecentCall.args[0]).toEqual('modules:tagentry:onchange');
       });

       it("should should populate the tag entry input when an autocomplete item is selected", function () {
            tagEntry.populate('foo', i);
            expect(common.mediator.emitEvent.mostRecentCall.args[0]).toEqual('ui:networkfronttool:tagid:selected');
            expect(i.val()).toEqual('foo');
       });

    });
});
