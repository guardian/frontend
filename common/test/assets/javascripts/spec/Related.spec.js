define(['common', 'ajax', 'modules/related'], function(common, ajax, Related) {

    describe("Related", function() {
       
        var callback, appendTo;

        beforeEach(function() {
            ajax.init({page: {
                ajaxUrl: "",
                edition: "UK"
            }});
            callback = sinon.stub();
            common.mediator.on('modules:related:loaded', callback);
        });

        afterEach(function() {
            if (appendTo) appendTo.innerHTML = "";
        });

        // json test needs to be run asynchronously 
        it("should request the related links and graft them on to the dom", function(){
            
            appendTo = document.querySelector('.js-related');

            runs(function() {
                new Related(
                    {switches: {relatedContent: true}, page: {}}, 
                    document,
                    'fixtures/json'
                );
            });

            waits(500);

            runs(function(){
                expect(callback).toHaveBeenCalledOnce();
                expect(appendTo.innerHTML).toBe('<b>1</b>');
            });
        });

        // json test needs to be run asynchronously
        it("should not request related links if switched off", function(){

            appendTo = document.querySelector('.js-related');

            runs(function() {
                new Related(
                    {switches: {relatedContent: false}, page: {}}, 
                    document,
                    'fixtures/json'
                );
            });

            waits(500);

            runs(function(){
                expect(appendTo.innerHTML).toBe('');
            });
        });
        
        xit("should request the related links per edition", function(){
            expect(0).toBeTruthy();
        });
    
    });
});
