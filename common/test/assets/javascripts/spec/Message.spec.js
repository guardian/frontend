define([
    'modules/ui/message', 
    'helpers/fixtures',
    '$'
], function(
    Message,
    fixtures,
    $
) {
    
    describe("Message", function() {

        var conf = {
                        id: 'message',
                        fixtures: [
                            '<div id="header"></div><div class="site-message"></div><div class="js-site-message-copy">...</div>'
                        ]
                  }
        
        beforeEach(function() {
            fixtures.render(conf);
        })
        
        afterEach(function() {
            fixtures.clean(conf.id);
        })
        
        it("Show a message", function(){
            new Message('foo').show('hello world');
            expect($('.js-site-message-copy').text()).toContain('hello world');
        });
        
        it("Hide a message", function(){
            var m = new Message('foo');
            m.show('hello world');
            m.hide();
            expect($('.site-message').hasClass('u-h')).toBeTruthy();
        })

        it("Remember the user has acknowledged the message", function(){
            sinon.spy(localStorage, 'setItem');
            var m = new Message('foo');
            m.acknowledge('hello world');
            expect(localStorage.setItem.lastCall.args[0]).toBe('gu.prefs.message.foo');
            expect(m.hasSeen()).toBeTruthy();
        })
    
        xit("Priority", function(){ })
        
    })
});
