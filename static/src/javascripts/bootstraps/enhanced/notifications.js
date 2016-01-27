define([
    'bonzo',
    'qwery',
    'bean',
    'common/utils/$',
    'lodash/collections/some',
    'lodash/arrays/uniq',
    'common/modules/user-prefs',
    'common/utils/storage'
], function(
    bonzo,
    qwery,
    bean,
    $,
    some,
    userPrefs
) {
    var modules, reg, sub,
        isSubscribed = false,
        subscribeButton = $('.js-follow-live-blog');

    function ready() {

        console.log('++ Notifications ready!');

        if ('serviceWorker' in navigator) {
            console.log("++ Notifications bootstrap init ready");

            navigator.serviceWorker.register('/notifications-service-worker.js')
                .then(modules.subscription)
                .catch(function(error){
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

       subscription: function() {
           console.log('++ Function subscribe');
           var self = this;



           navigator.serviceWorker.ready.then(function(serviceWorkerRegistration){
               reg = serviceWorkerRegistration;
               serviceWorkerRegistration.pushManager.getSubscription().then(function(pushSubscription){
                   console.log('Might have a subscription');
                   subscribeButton.removeClass('js-hide-follow-button');
                   subscribeButton[0].disabled = false;
                   bean.on(subscribeButton[0], 'click', modules.buttonHandler);
                   console.log('Might have a subscription');

                   if(pushSubscription) {
                        modules.log("got subscription");
                        sub = pushSubscription;
                        modules.log("Subscribed: " + sub.endpoint);
                        modules.setSubscriptionStatus(true);
                        return;
                   } else {
                       modules.setSubscriptionStatus(false);
                   }
                    console.log("++ No subscription")
               });
           });
           console.log("After: Subscribed");
       },

       setSubscriptionStatus: function(subscribed) {
            isSubscribed = subscribed;
            subscribeButton[0].textContent = subscribed ?  'Unsubscribe': 'Subscribe'
       },


       doThis: function() {
           modules.log("+++++++++++++++++ HIYA");
           subscribeButton.removeClass('js-hide-follow-button');
           subscribeButton[0].disabled = false;
           var self = this;
           bean.on(subscribeButton[0], 'click', modules.buttonHandler ).bind(self);

       },

       register: function(serviceWorkerRegistration){
           reg = serviceWorkerRegistration;
           subscribeButton.removeClass('js-hide-follow-button');
           subscribeButton[0].disabled = false;
           bean.on(subscribeButton[0], 'click', modules.buttonHandler ).bind(this);

           modules.log('Notifications service worker is ready: ^)', reg);
       },

       buttonHandler: function(){
            modules.log("++ Handler");
            if(isSubscribed) {
                modules.unSubscribe();
            } else {
                modules.subscribe();
            }
       },

       setButtonText: function(text) {
           subscribeButton[0].textContent = text;
       },

       subscribe: function() {
           modules.log("++ Subscribe");
           reg.pushManager.subscribe({userVisibleOnly: true}).then(function(pushSubscription){
               sub = pushSubscription;
               modules.log("Subscribed: " + sub.endpoint);
               subscribeButton[0].textContent = 'Unsubscribe';
               isSubscribed = true;

           });
       },

       unSubscribe: function() {
           modules.log("++ Unsubscribe");
           sub.unsubscribe().then( function(event) {
               console.log('Unsubscribed', event);
               subscribeButton[0].textContent = 'Subscribe';
               isSubscribed = false;
           }).catch( function(error){
              console.log('Error unsubscribing', error);
              subscribeButton[0].textContent = 'Unsubscribe';
           });
       }
    };

    return {
        init: ready
    };
});
