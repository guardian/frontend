define([
    'bonzo',
    'qwery',
    'bean',
    'common/utils/$',
    'common/utils/config',
    'common/utils/storage',
    'common/utils/ajax',
    'lodash/collections/some',
    'common/modules/user-prefs',
    'lodash/arrays/uniq',
    'lodash/arrays/without'
], function(
    bonzo,
    qwery,
    bean,
    $,
    config,
    storage,
    ajax,
    some,
    userPrefs,
    uniq,
    without
) {
    var modules, reg, sub,
        isSubscribed = false,
        subscribeButton = $('.js-follow-live-blog'),
        debug = true;

    function ready() {

        modules.log('++ Notifications ready!' + " pageId: *** /" + config.page.pageId);

        if ('serviceWorker' in navigator) {
            modules.log("++ Notifications bootstrap init ready");
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
           if(debug)
                console.log(message);
       },

       subscription: function() {
           modules.log('++ Function subscribe');

           navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
               modules.log('++ READY');
               reg = serviceWorkerRegistration;
               subscribeButton.removeClass('js-hide-follow-button');
               subscribeButton[0].disabled = false;
               bean.on(subscribeButton[0], 'click', modules.buttonHandler);
               if(modules.isSubscribedTo()) {
                   modules.log("Subscribed to this");
                   modules.setSubscriptionStatus(true);
               }
               serviceWorkerRegistration.pushManager.getSubscription().then(function(pushSubscription){
                   modules.log('Might have a subscription');

                   if(pushSubscription) {
                        modules.log("got subscription");
                        sub = pushSubscription;
                        modules.log("Subscribed: " + sub.endpoint);
                        return;
                   } else {
                       modules.setSubscriptionStatus(false);
                   }
                    modules.log("++ No subscription")
               });
           });
           modules.log("After: Subscribed");
       },

       setSubscriptionStatus: function(subscribed) {
            isSubscribed = subscribed;
            subscribeButton[0].textContent = subscribed ?  'Unsubscribe': 'Subscribe'
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
           if(modules.subscriptionsEmpty()) {
               modules.log("++ First sub. Subscribing");
               reg.pushManager.subscribe({userVisibleOnly: true}).then(function (pushSubscription) {
                   sub = pushSubscription;
                   modules.log("Subscribed: " + sub.endpoint + "Id: - " + sub.subscriptionId);
               });
           }
           modules.followThis();
       },


       unSubscribe: function() {
           modules.log("++ Unsubscribe");
           modules.stopFollowingThis();
           if(modules.subscriptionsEmpty()) {
               modules.log("++ Last subscription");
               sub.unsubscribe().then(function (event) {
                   modules.log('Unsubscribed', event);
               }).catch(function (error) {
                   modules.log('Error unsubscribing', error);
               });
           }
       },

       subscriptionsEmpty: function() {
           var subscriptions = userPrefs.get('subscriptions') || [];
           return subscriptions.length == 0;
       },

       isSubscribedTo: function() {
           var subscriptions = userPrefs.get('subscriptions') || [];
           return some(subscriptions, function (sub) {
                return sub == config.page.pageId;
           });
       },

       //TODO AJAX the subscription to RDS
       followThis: function() {
           modules.log("++ Subscribe");
           var endpoint = '/notification/store';
           modules.updateSubscription(endpoint).then(
               function (rsp) {
                   modules.log("++ Done: " + JSON.stringify(rsp));
                   var subscriptions = userPrefs.get('subscriptions') || [];
                   subscriptions.push(config.page.pageId);
                   userPrefs.set('subscriptions', uniq(subscriptions));
                   modules.setSubscriptionStatus(true);
               }
           );
       },

       stopFollowingThis: function() {

           modules.log("++ Stop");
           var endpoint = '/notification/delete';
           modules.updateSubscription(endpoint).then(
               function(rsp) {
                   modules.log("++ Done: " + JSON.stringify(rsp));
                   ++CHECK is empty!
                   var subscriptions = userPrefs.get('subscriptions') || [],
                       newSubscriptions = without(subscriptions, config.page.pageId);
                   userPrefs.set('subscriptions', uniq(newSubscriptions));
                   modules.setSubscriptionStatus(false);
               }
           );
       },

       updateSubscription: function(endpoint) {
           var registrationId = sub.endpoint.substring(sub.endpoint.lastIndexOf('/') + 1),
               request =  ajax({
               url: endpoint,
               method: 'POST',
               contentType: 'application/x-www-form-urlencoded',
               data: {registration_id: registrationId, content_id: config.page.pageId }
           });
           return request;
       }
    };

    return {
        init: ready
    };
});
