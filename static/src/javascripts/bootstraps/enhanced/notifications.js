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
        subscribeButton = $('.js-follow-live-blog');

    modules = {

       subscription: function() {

           navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
               reg = serviceWorkerRegistration;
               subscribeButton.removeClass('js-hide-follow-button');
               subscribeButton[0].disabled = false;
               bean.on(subscribeButton[0], 'click', modules.buttonHandler);
               if(modules.checkSubscriptions()) {
                   modules.setSubscriptionStatus(true);
               }
               serviceWorkerRegistration.pushManager.getSubscription().then(function(pushSubscription){

                   if(pushSubscription) {
                        sub = pushSubscription;
                        return;
                   }
               });
           });
       },

       setSubscriptionStatus: function(subscribed) {
            isSubscribed = subscribed;
            subscribeButton[0].textContent = subscribed ?  'Unsubscribe': 'Subscribe'
       },

       buttonHandler: function(){
            if(isSubscribed) {
                modules.stopFollowingThis();
            } else {
                modules.subscribe();
            }
       },

       subscribe: function() {
           if(modules.subscriptionsEmpty()) {
               reg.pushManager.subscribe({userVisibleOnly: true}).then(function (pushSubscription) {
                   console.log("++ New sub: " + sub.endpoint);
                   sub = pushSubscription;
               });
           }
           modules.followThis();
       },


       unSubscribe: function() {
           if(modules.subscriptionsEmpty()) {
               sub.unsubscribe().then(function (event) {
               }).catch(function (error) {
               });
           }
       },

       subscriptionsEmpty: function() {
           var subscriptions = userPrefs.get('subscriptions') || [];
           var b = subscriptions.length ? false : true;
           return b;
       },

       checkSubscriptions: function() {
           var subscriptions = userPrefs.get('subscriptions') || [];
           return some(subscriptions, function (sub) {
                return sub == config.page.pageId;
           });
       },

       followThis: function() {
           var endpoint = '/notification/store';
           modules.updateSubscription(endpoint).then(
               function (rsp) {
                   var subscriptions = userPrefs.get('subscriptions') || [];
                   subscriptions.push(config.page.pageId);
                   userPrefs.set('subscriptions', uniq(subscriptions));
                   modules.setSubscriptionStatus(true);
               }
           );
       },

       stopFollowingThis: function() {

           var endpoint = '/notification/delete';
           modules.updateSubscription(endpoint).then(
               function(rsp) {
                   var subscriptions = userPrefs.get('subscriptions') || [],
                       newSubscriptions = without(subscriptions, config.page.pageId);
                   userPrefs.set('subscriptions', uniq(newSubscriptions));
                   modules.setSubscriptionStatus(false);
                   if(modules.subscriptionsEmpty()) {
                       console.log("++ Subs empty") ;
                       modules.unSubscribe();
                   }
               }
           );
       },

       updateSubscription: function(endpoint) {

           var gcmBrowserId = sub.endpoint.substring(sub.endpoint.lastIndexOf('/') + 1),
               request =  ajax({
               url: endpoint,
               method: 'POST',
               contentType: 'application/x-www-form-urlencoded',
               data: {gcmBrowserId: gcmBrowserId, notificationTopicId: config.page.pageId }
           });
           return request;
       }
    };

    return {
        init: modules.subscription()
    };
});
