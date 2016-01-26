define([
    'bonzo',
    'qwery',
    'bean',
    'common/utils/$'
], function(
    bonzo,
    qwery,
    bean,
    $
) {
    var modules, reg, sub,
        isSubscribed = false;

    function ready() {

        //var subscribeButton = bonzo(qwery('.js-follow-live-blog'));
        var subscribeButton = $('.js-follow-live-blog');

        console.log('++ Notifications ready');


        if ('serviceWorker' in navigator) {
            console.log("++ Notifications bootstrap init ready");

            navigator.serviceWorker.register('/notifications-service-worker.js').then( function() {
                modules.log('++ Service worker registered');
                return navigator.serviceWorker.ready;
            }).then(function(serviceWorkerRegistration){
                reg = serviceWorkerRegistration;
                subscribeButton.removeClass('js-hide-follow-button');
                subscribeButton[0].disabled = false;
                bean.on(subscribeButton[0], 'click', function () {
                   console.log('Got click');
                   modules.buttonHandler();
                }).bind(this);

                modules.log('Notifications service worker is ready: ^)', reg);
            }).catch(function(error){
                modules.log('Service worker error:^', error);
            });
        } else {
            modules.log('There is no service worker');
        }
    }

    modules = {
       log: function(message) {
           console.log(message);
       },

       buttonHandler: function(){
            modules.log("++ Handler");
            if(isSubscribed) {
                modules.unSubscribe();
            } else {
                modules.subscribe();
            }
       },

       subscribe: function() {
           modules.log("++ Subscribe");
           isSubscribed = true;
       },

       unSubscribe: function() {
           modules.log("++ Unsubscribe");
           isSubscribed = false;;
       }
    };

    return {
        init: ready
    };
});
