define(['common', 'modules/related'], function(common, Related) {

    describe("Related", function() {
        
        // FIXME scoping??
        beforeEach(function(){
            xhr = sinon.useFakeXMLHttpRequest();
            server = sinon.fakeServer.create();
            server.respondWith("GET", "/foo", [200, {}, '{"<b>1</b>"}']);
            
            callback = sinon.spy(function(){});
            common.pubsub.on('modules:related:loaded', callback);
        });

        it("should request the related links and graft them on to the dom", function(){
            var r = new Related(document.getElementById('related')).load('/foo');
            server.respond();
            expect(callback).toHaveBeenCalledOnce();
            expect(document.getElementById('related').innerHTML).toBe('<b>1</b>');
        });
        
        xit("should request the related links per edition", function(){
            expect(0).toBeTruthy();
        });
    
    });
})
