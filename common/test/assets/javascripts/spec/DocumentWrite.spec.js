define([
    'common',
    'domwrite',
    'ajax',
    'modules/adverts/document-write',
    'modules/adverts/documentwriteslot',
    'modules/adverts/dimensionMap',
    'modules/local-storage',
    ], function(
        common,
        domwrite,
        ajax,
        DocumentWrite,
        DocumentWriteSlot,
        dimensionMap,
        localStorage
    )  {

    var slots = [
        {name:'Top2'},
        {name:'Bottom2'}
    ];

    var config = {
        page: {
            'keywords': 'keyword,go here,there',
            'oasUrl':"http://oas.guardian.co.uk/RealMedia/ads/",
            'oasSiteId':"m.guardian.co.uk/oas.html",
            'contentType': 'contentType',
            'section': 'section',
            'pageType': 'page',
            'pageId': 'environment/2012/foo',
            'audienceScienceUrl': 'http://js.revsci.net/gateway/gw.js?csid=E05516'
        }
    };
   
    beforeEach(function(){
        ajax.init({page: {
            ajaxUrl: "",
            edition: "UK"
        }});
        localStorage.set('gu.ads.audsci', ["E012390","E012782"]);
        common.mediator.removeEvent();
    });
 
    // deterministic 'randomness' - http://davidbau.com/archives/2010/01/30/random_seeds_coded_hints_and_quintillions.html 
    Math.seedrandom('gu');

    describe("DocumentWrite", function() {

        it("Construct an OAS request using page metadata", function() {
            var d = DocumentWrite.generateUrl(config.page, slots),
                url = 'http://oas.guardian.co.uk/RealMedia/ads/adstream_mjx.ads/m.guardian.co.uk/environment/2012/foo/oas.html/627177383@Top2,Bottom2?k=keyword&k=go-here&k=there&pt=contenttype&ct=contenttype&cat=section&a=E012390&a=E012782';
            expect(d).toBe(url);
        });

        it("Buffer multiple document.write calls", function() {

            slots = [];

            common.mediator.on('modules:adverts:docwrite:loaded', function() {
                domwrite.capture();
                for (var i = 0, j = slots.length; i<j; ++i) {
                    if (!slots[i].loaded) {
                        slots[i].render();
                    }
                }
            });

            var slotHolders = document.querySelectorAll('.ad-slot'),
                size = 'base';

            // Run through slots and create documentWrite for each.
            for(var i = 0, j = slotHolders.length; i < j; ++i) {
                var name = slotHolders[i].getAttribute('data-' + size);
                var slot = new DocumentWriteSlot(name, slotHolders[i].querySelector('.ad-container'));
                slot.setDimensions(dimensionMap[name]);
                slots.push(slot);
            }

            //Make the request to ad server
            DocumentWrite.load({
                config: config,
                slots: slots,
                url: 'fixtures/oas'
            });

            waitsFor(function(){
                return (window.admeld_url != undefined); // variable evaluated in fixtures
            }, "window.admeld_url never evaluated", 1000);
            
            runs(function(){ 
                expect(window.admeld_url).toBeTruthy();
                //expect(document.getElementById('advert-via-doc-write')).toBeTruthy()
            })
        });
        
        xit("Pass audience science tags to the OAS", function() {
            
            DocumentWrite.load('fixtures/oas');
             
            waitsFor(function(){
                return (window.admeld_url != undefined); // variable evaluated in fixtures
            }, "window.admeld_url never evaluated", 1000);
            
            runs(function(){ 
                expect(window.admeld_url).toBeTruthy();
                expect(document.getElementById('advert-via-doc-write')).toBeTruthy()
            })
        });

    });

});

