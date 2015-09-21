define([
    'react',
    'common/utils/_',
    'common/utils/$',
    'common/utils/config',
    'common/modules/onward/history'
], function (
    React,
    _,
    $,
    config,
    history
) {
    return function () {
        var placeholder = document.getElementById('preferences-history-tags'),

            initialiseSummaryTagsSettings = function () {
                var SummaryTagsSettings = React.createClass({
                        getInitialState: function () {
                            return {enabled: history.showInMegaNavEnabled()};
                        },
                        handleToggle: function () {
                            var isEnabled = !this.state.enabled;

                            this.setState({enabled: isEnabled});
                            history.showInMegaNavEnable(isEnabled);
                        },
                        render: function () {
                            var self = this,
                                toggleAction = this.state.enabled ? 'OFF' : 'ON';

                            return React.DOM.div({'data-link-name': 'suggested links'}, [
                                React.DOM.p(null, 'These are based on the topics you visit most. You can access them at any time by opening the "all sections” menu.'),
                                this.state.enabled ? React.createElement(SummaryTagsList) : null,
                                React.DOM.button({
                                    onClick: self.handleToggle,
                                    className: 'button button--medium button--primary',
                                    'data-link-name': toggleAction
                                }, 'Switch recently visited links ' + toggleAction)
                            ]);
                        }
                    }),

                    SummaryTagsList = React.createClass({
                        getInitialState: function () {
                            return {popular: history.getPopularFiltered()};
                        },
                        handleRemove: function (tag) {
                            history.deleteFromSummary(tag);
                            this.setState({popular: history.getPopularFiltered({flush: true})});
                            history.showInMegaNav();
                        },
                        render: function () {
                            var self = this,
                                tags = _.reduce(this.state.popular, function (obj, tag) {
                                    obj[tag[0]] = React.DOM.span({className: 'button button--small button--tag button--secondary'},
                                        React.DOM.button({
                                            onClick: self.handleRemove.bind(self, tag[0]),
                                            'data-link-name': 'remove | ' + tag[1]
                                        }, 'X'),
                                        React.DOM.a({
                                            href: '/' + tag[0]
                                        }, tag[1])
                                    );
                                    return obj;
                                }, {}),
                                helperText;

                            if (_.isEmpty(tags)) {
                                helperText = '(You don\'t have any recently visited topics.)';
                            } else {
                                helperText = 'Remove individual topics by clicking \'X\' or switch off the functionality below. We respect your privacy and your shortcuts will never be made public.';
                            }
                            tags.helperText = React.DOM.p(null, helperText);
                            return React.DOM.div(null, tags);
                        }
                    });

                React.render(React.createElement(SummaryTagsSettings), placeholder);
            },

            initialiseNotificationPreferences = function () {
                var isPushEnabled = false;

                var pushButton = document.querySelector('.js-push-button');

                var updateState = function (options) {
                    if (options.pushEnabled) {
                        pushButton.textContent = 'Disable';
                        isPushEnabled = true;
                    } else {
                        pushButton.textContent = 'Enable';
                        isPushEnabled = false;
                    }
                };

                var initialiseState = function () {
                    return navigator.serviceWorker.ready
                        .then(function (serviceWorkerRegistration) {
                            // Do we already have a push message subscription?
                            return serviceWorkerRegistration.pushManager.getSubscription()
                                .then(function (subscription) {
                                    pushButton.disabled = false;

                                    var match = window.location.hash.match(/^#redirect=(.*?)$/);
                                    if (match) {
                                        var redirectUrl = match[1];
                                        var redirect = function () {
                                            window.location.href = redirectUrl;
                                        };
                                        if (subscription) {
                                            redirect();
                                        } else {
                                            return subscribe().then(redirect);
                                        }
                                    } else if (subscription) {
                                        updateState({ pushEnabled: true });

                                        // Keep server in sync
                                        return sendSubscription(subscription);
                                    }
                                });
                        });
                };

                var subscribe = function () {
                    // Disable the button so it can't be changed while
                    // we process the permission request
                    pushButton.disabled = true;
                    var willRequestNotificationPermission = Notification.permission === 'default';

                    return navigator.serviceWorker.ready
                        .then(function (serviceWorkerRegistration) {
                            if (willRequestNotificationPermission) {
                                $('.js-notifications-preferences-overlay').css('display', 'block');
                            }

                            return serviceWorkerRegistration.pushManager.subscribe()
                                .then(function (subscription) {
                                    updateState({ pushEnabled: true });
                                    pushButton.disabled = false;

                                    return sendSubscription(subscription);
                                });
                        })
                        .then(function () {
                            if (willRequestNotificationPermission) {
                                $('.js-notifications-preferences-overlay').css('display', 'none');
                            }
                        });
                };

                var unsubscribe = function () {
                    // Disable the button so it can't be changed while
                    // we process the permission request
                    pushButton.disabled = true;

                    return navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
                        return serviceWorkerRegistration.pushManager.getSubscription()
                            .then(function (subscription) {
                                if (!subscription) {
                                    // No subscription? Reset UI
                                    pushButton.disabled = false;
                                    updateState({ pushEnabled: false });
                                } else {
                                    return subscription.unsubscribe()
                                        .then(function () {
                                            pushButton.disabled = false;
                                            updateState({ pushEnabled: false });

                                            return sendSubscription(subscription, { delete: true });
                                        });
                                }
                            });
                    });
                };

                var sendSubscription = function (subscription, options) {
                    options = options || {};
                    // TODO: var url

                    var mobileNotificationsWebHost = config.page.pushNotificationsHost;

                    if (!mobileNotificationsWebHost) {
                        throw new Error('No notifications host found');
                    }

                    /*global fetch, Headers*/
                    return fetch(mobileNotificationsWebHost + '/?url=http://push-api-web.gutools.co.uk/web/subscription', {
                        method: options.delete ? 'DELETE' : 'POST',
                        headers: new Headers({ 'Content-Type': 'application/json' }),
                        // TODO: Support deprecated subscriptionId (now part of endpoint)
                        body: JSON.stringify({
                            subId: subscription.subscriptionId,
                            endpoint: subscription.endpoint.replace('/' + subscription.subscriptionId, '')
                            // TODO: edition based notifications
                            //edition: config.page.edition
                        })
                    });
                };

                pushButton.addEventListener('click', function () {
                    if (isPushEnabled) {
                        unsubscribe();
                    } else {
                        subscribe();
                    }
                });

                navigator.serviceWorker.register('/service-worker.js')
                    .then(initialiseState);
            };

        switch (config.page.pageId) {
            case 'preferences/notifications':
                initialiseNotificationPreferences();
                break;
            case 'preferences':
                if (placeholder) {
                    initialiseSummaryTagsSettings();
                }
                break;
        }
    };
});
