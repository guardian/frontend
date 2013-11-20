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
                        '<div id="header"></div><div class="site-message u-h"></div><div class="js-site-message-copy">...</div>'
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
            expect($('.site-message').hasClass('u-h')).toBeFalsy();
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
    
        it("Block messages from overwriting each other", function(){
            var m1 = new Message('foo');
            var m2 = new Message('bar');
            m1.show('message one');
            m2.show('message two');
            expect($('.js-site-message-copy').text()).toContain('message one');
        })
        
        it("Allow 'important' messages from overwriting each other", function(){
            var m1 = new Message('a');
            var m2 = new Message('b', { important: true });
            var m3 = new Message('c');
            m1.show('message one');
            m2.show('message two');
            m3.show('message three');
            expect($('.js-site-message-copy').text()).toContain('message two');
        })
        
    })
});
