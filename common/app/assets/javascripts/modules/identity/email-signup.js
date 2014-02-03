/*
    Module: email-signup.js
    Description: Interaction for ui element allowing signup to email subscriptions
    Author: Chris Finch
*/

define([
    "bean",
    "bonzo",
    "common/utils/ajax",
    "common/modules/identity/api",
    "common/utils/storage"
], function(bean, bonzo, ajax, IdApi, Storage) {

    var EmailSignup = function (context) {

        var container = context.querySelector(".email-signup");

        this.DOM = {
            container: container,
            button: container.querySelector(".email-signup__link"),
            loader: container.querySelector(".is-updating"),
            title: container.querySelector(".email-signup__title")
        };

        this.emailHash = "#email-subscribe";
        this.storageKey = "gu.emails.subsriptions";
        this.storageData = Storage.local.get(this.storageKey) || {listIds: []};
        this.listId = this.DOM.button.getAttribute("data-list-id");

        for (var key in this.DOM) {
            if (this.DOM.hasOwnProperty(key)) {
                this.DOM["$" + key] = bonzo(this.DOM[key]);
            }
        }

        if (this.DOM.container && (this.DOM.container.children && this.DOM.container.children.length > 0) && !this.checkStorage(this.listId)) {
            this.DOM.$container.removeClass("is-hidden");
            if (!this.checkHash(window.location.hash)) {
                var click = function (event) {
                    event.preventDefault();
                    this.requestEmailSignup();
                };
                bean.on(this.DOM.button, "click", click.bind(this));
            }
        }

    };

    /*
     *  If a user is not signed in, redirect them, otherwise subscribe them to the list and adjust the UI accordingly
     */
    EmailSignup.prototype.requestEmailSignup = function () {
        var self = this;

        if (!IdApi.isUserLoggedIn()) {
            this.redirectToSignin();
        } else {
            this.DOM.$container.css("height", this.DOM.$container.css("height"));
            self.DOM.$container.addClass("email-signup--loading");
            IdApi.emailSignup(self.listId).then(function success (res) {
                self.DOM.$container.removeClass("email-signup--loading").addClass("email-signup--done");
                if (res.status === "ok") {
                    self.DOM.$button.remove();
                    self.DOM.title.innerHTML = "Your subscription will be activated within 24 hours";
                    self.updateStorage(self.listId);
                } else {
                    self.DOM.$button.remove();
                    self.DOM.title.innerHTML = "An error occured, please reload and try again";
                }
            }, function error () {
                self.DOM.$container.removeClass("email-signup--loading");
                self.DOM.$button.remove();
                self.DOM.title.innerHTML = "An error occured, please reload and try again";
            });
        }
    };

    /*
     *  CF: identity/api.js Id.getUserOrSignIn
     */
    EmailSignup.prototype.redirectToSignin = function () {
            var returnUrl = encodeURIComponent(document.location.href+this.emailHash);
            var url = IdApi.getUrl() + '/signin?returnUrl=' + returnUrl;
            IdApi.redirectTo(url);
    };

    EmailSignup.prototype.checkHash = function(hash) {
        var hash_parts = hash.split("&");
        for (var i = hash_parts.length - 1; i >= 0; i--) {
            if (hash_parts[i] === this.emailHash) {
                this.requestEmailSignup();
            }
        }
    };

    EmailSignup.prototype.checkStorage = function(id) {
        var found = false;
        for (var i = this.storageData.listIds.length - 1; i >= 0; i--) {
            if (parseInt(this.storageData.listIds[i], 10) === parseInt(id, 10)) {
                found = true;
            }
        }
        return found;
    };

    /*
     *  Check local storage for the list id and don't display the widget if the user is already subscribed
     */
    EmailSignup.prototype.updateStorage = function(id) {

        // data format:
        // {listIds: [123, 456, 789, ... ]}

        var options = {}; // possibility to add expiry date

        this.storageData.listIds.push(id);
        Storage.local.set(this.storageKey, this.storageData, options);
    };

    return EmailSignup;
});
