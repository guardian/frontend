define(['utils/mediator', 'utils/ajax', 'modules/onward/sequence'], function(mediator, ajax, sequence) {

    describe("Sequence", function() {
        var sequenceLoadedCallback,
            server,
            response = JSON.stringify({
                trails: [
                    {"url": "/p/3k4vt"},
                    {"url": "/p/3k44f"},
                    {"url": "/p/3k43n"},
                    {"url": "/p/3k44b"}
                ]
            });

        var setStorageItem = function(key, item, type) {
            window[type].setItem('gu.' + key, JSON.stringify({
                'value' : item
            }));
        };

        beforeEach(function() {
            ajax.init({page: {
                ajaxUrl: "",
                edition: "UK"
            }});
            sequenceLoadedCallback = sinon.stub();
            mediator.on('modules:sequence:sequence:loaded', sequenceLoadedCallback);

            //Set up fake server
            server = sinon.fakeServer.create();
            server.autoRespond = true;
            server.autoRespondAfter = 20;
            server.respondWith('/uk/news.json?_edition=UK', [200, {}, response]);
            //Set up storage
            setStorageItem('context.path', 'uk/news', 'sessionStorage');
            setStorageItem('context.name', 'uk news', 'sessionStorage');
            setStorageItem('history', [{"id":"/p/3k43n"}], 'localStorage');
        });

        afterEach(function () {
            server.restore();
            window.sessionStorage.removeItem('gu.context.path');
            window.sessionStorage.removeItem('gu.context.name');
            window.localStorage.removeItem('gu.sequence');
        });

        it("should load a sequence from the server if none available", function(){

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
                return sequenceLoadedCallback.calledWith({name: 'uk news', items: [{url: "/p/3k4vt"},{url: "/p/3k44f"},{url: "/p/3k44b"}]});
            }, 'sequence was not deduped', 500);

        });

        it("should remove current page from sequence", function(){

            runs(function() {
                sequence.init("/p/3k44f");
            });

            waitsFor(function () {
                return sequenceLoadedCallback.calledWith({name: 'uk news', items: [{url: "/p/3k4vt"},{url: "/p/3k44b"}]});
            }, 'sequence did not remove current page from sequence', 500);

        });

    });
});
