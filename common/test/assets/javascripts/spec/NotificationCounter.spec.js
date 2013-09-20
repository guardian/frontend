define([ 'common',
         'bean',
         'modules/notification-counter',
       ], function(common, bean, NotificationCounter) {


        describe("Notification Counter", function() {

            var originalPageTitle = document.title,
                notification;

            beforeEach(function() {
                document.title = originalPageTitle;
                notification = new NotificationCounter;
                notification.init();
            });

            it("should put a counter in the title bar", function() {
                notification.setCount(2);
                expect(document.title).toContain('(2)');
            });

            it("should restore the title when counter set to 0", function() {
                notification.setCount(0);
                expect(document.title).toBe(originalPageTitle);
            });

            it("should show an unread count when modules:autoupdate:unread is fired", function() {
                common.mediator.emit('modules:autoupdate:unread', 5);
                expect(document.title).toContain('(5)');
            });
        });
    });
