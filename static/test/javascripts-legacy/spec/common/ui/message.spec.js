define([
    'common/modules/ui/message',
    'helpers/fixtures',
    'common/utils/$'
], function (
    Message,
    fixtures,
    $
) {
    describe('Message', function () {

        var conf = {
            id: 'message',
            fixtures: [
                '<div id="header" class="l-header"></div>' +
                '<div class="js-site-message is-hidden">' +
                    '<div class="js-site-message-copy">...</div>' +
                    '<button class="site-message__close"></button>' +
                '</div>' +
                '<div class="site-message--footer is-hidden js-footer-message"> ' +
                    '<div class="site-message__copy js-footer-site-message-copy u-cf"></div> ' +
                '</div>'
            ]
        };

        beforeEach(function () {
            fixtures.render(conf);
        });

        afterEach(function () {
            fixtures.clean(conf.id);
            localStorage.clear();
        });

        it('Show a message', function () {
            new Message('foo').show('hello world');
            expect($('.js-site-message-copy').text()).toContain('hello world');
            expect($('.js-footer-site-message-copy').text()).not.toContain('hello world');
            expect($('.js-site-message').hasClass('is-hidden')).toBeFalsy();
        });

        it('Show a pinnable message', function () {
            new Message('foo', {pinOnHide: true}).show('hello world');
            expect($('.js-site-message-copy').text()).toContain('hello world');
            expect($('.js-footer-site-message-copy').text()).toContain('hello world');
            expect($('.js-site-message').hasClass('is-hidden')).toBeFalsy();
        });

        it('Hide a message', function () {
            var m = new Message('foo');
            m.show('hello world');
            m.hide();
            expect($('.js-site-message').hasClass('is-hidden')).toBeTruthy();
            expect($('.js-footer-message').hasClass('is-hidden')).toBeTruthy();
        });

        it('Hide a pinnable message', function () {
            var m = new Message('foo', {pinOnHide: true});
            m.show('hello world');
            m.hide();
            expect($('.js-site-message').hasClass('is-hidden')).toBeTruthy();
            expect($('.js-footer-message').hasClass('is-hidden')).toBeFalsy();
        });

        it('Remember the user has acknowledged the message', function () {
            sinon.spy(localStorage, 'setItem');
            var m = new Message('foo');
            m.acknowledge('hello world');
            expect(localStorage.setItem).toHaveBeenCalledWith('gu.prefs.messages', JSON.stringify({value: ['foo']}));
            expect(m.hasSeen()).toBeTruthy();
        });

        it('Block messages from overwriting each other', function () {
            var m1 = new Message('foo');
            var m2 = new Message('bar');
            m1.show('message one');
            m2.show('message two');
            expect($('.js-site-message-copy').text()).toContain('message one');
        });

        it('Allow \'important\' messages to overwrite an existing message', function () {
            var m1 = new Message('a');
            var m2 = new Message('b', { important: true });
            var m3 = new Message('c');
            m1.show('message one');
            m2.show('message two');
            m3.show('message three');
            expect($('.js-site-message-copy').text()).toContain('message two');
        });

        it('has option to stay permanently open', function () {
            new Message('a', { permanent: true }).show('message one');
            expect($('.site-message__close').hasClass('is-hidden')).toBeTruthy();
        });

        it('permanent message should have class added', function () {
            new Message('a', { permanent: true }).show('message one');
            expect($('.site-message--permanent').length).toEqual(1);
        });

    });
});
