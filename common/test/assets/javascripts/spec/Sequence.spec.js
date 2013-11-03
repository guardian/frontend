define(['common', 'ajax', 'modules/onward/sequence'], function(common, ajax, sequence) {

    describe("Sequence", function() {
        var sequenceLoadedCallback,
            server,
            response = JSON.stringify({
                trails: [
                    "http://gu.com/p/3k4vt",
                    "http://gu.com/p/3k44f",
                    "http://gu.com/p/3k43n",
                    "http://gu.com/p/3k44b"
                ]
            });

        var setStorageItem = function(key, item) {
            window.localStorage.setItem('gu.' + key, JSON.stringify({
                'value' : item
            }));
        };

        beforeEach(function() {
            ajax.init({page: {
                ajaxUrl: "",
                edition: "UK"
            }});
            sequenceLoadedCallback = sinon.stub();
            common.mediator.on('modules:sequence:sequence:loaded', sequenceLoadedCallback);
            //Set up fake server
            server = sinon.fakeServer.create();
            server.autoRespond = true;
            server.autoRespondAfter = 20;
            server.respondWith('/world.json?_edition=UK', [200, {}, response]);
            //Set up storage
            setStorageItem('context', 'world');
            setStorageItem('history', [{"id":"/p/3k43n"}]);
        });

        afterEach(function () {
            server.restore();
            window.localStorage.removeItem('gu.context');
            window.localStorage.removeItem('gu.sequence');
        });

        it("should load a sequence from the server if none avaliable", function(){

            runs(function() {
                sequence.init();
            });

            waitsFor(function () {
                return sequenceLoadedCallback.calledOnce === true;
            }, 'sequence callback never called', 500);

        });

        it("should remove articles the user has already read from sequence", function(){

            runs(function() {
                sequence.init();
            });

            waitsFor(function () {
                return sequenceLoadedCallback.calledWith(["/p/3k4vt", "/p/3k44f", "/p/3k44b"]);
            }, 'sequence was not deduped', 500);

        });

    });
});
