define([
    'common',
    'modules/adverts/document-write'
    ], function(common, DocumentWrite) {

    var slots = [
        {name:'Top2'},
        {name:'Bottom2'}
    ]

    var config = {
        page: {
            'keywords': 'keyword,go,here',
            'oasUrl':"http://oas.guardian.co.uk/RealMedia/ads/",
            'oasSiteId':"m.guardian.co.uk/oas.html",
            'contentType': 'contentType',
            'section': 'section',
            'pageType': 'page',
            'pageId': 'environment/2012/foo',
            'audienceScienceUrl': 'http://js.revsci.net/gateway/gw.js?csid=E05516'
        }
    }
   
    beforeEach(function(){
        localStorage.setItem('gu.ads.audsci', '["E012390","E012782"]'); 
        common.mediator.removeAllListeners();
    });
 
    // deterministic 'randomness' - http://davidbau.com/archives/2010/01/30/random_seeds_coded_hints_and_quintillions.html 
    Math.seedrandom('gu');

    describe("DocumentWrite", function() {

        it("Construct an OAS request using page metadata", function() {
            var d = DocumentWrite.generateUrl(config.page, slots),
                url = 'http://oas.guardian.co.uk/RealMedia/ads/adstream_mjx.ads/m.guardian.co.uk/environment/2012/foo/oas.html/627177383@Top2,Bottom2?k=keyword&k=go&k=here&pt=contenttype&ct=contenttype&cat=section&a=E012390&a=E012782';
            expect(d).toBe(url);
        });
        
        xit("Buffer multiple document.write calls", function() {
            
            var d = DocumentWrite.load('fixtures/oas');
            
            waitsFor(function(){
                return (window.admeld_url != undefined) // variable evaluated in fixtures 
            }, "window.admeld_url never evaluated", 1000)
            
            runs(function(){ 
                expect(window.admeld_url).toBeTruthy()
                expect(document.getElementById('advert-via-doc-write')).toBeTruthy()
            })
        });
        
        xit("Pass audience science tags to the OAS", function() {
            
            var d = DocumentWrite.load('fixtures/oas');
             
            waitsFor(function(){
                return (window.admeld_url != undefined) // variable evaluated in fixtures 
            }, "window.admeld_url never evaluated", 1000)
            
            runs(function(){ 
                expect(window.admeld_url).toBeTruthy()
                expect(document.getElementById('advert-via-doc-write')).toBeTruthy()
            })
        });

    });

});

