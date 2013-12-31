define([
    "bean",
    "bonzo",
    "common/utils/ajax",
    "common/modules/identity/api"
], function(bean, bonzo, ajax, IdApi) {

	/* TODO: use local storage to hide if already sign up */
	
	var EmailSignup = function (context, variant) {

		var container;

		if (variant) {
			if (variant.indexOf('-alt') > 1) {
				container = context.querySelector(".email-signup" + "___" + variant.substr(0, variant.indexOf('-alt')));
				bonzo(container).addClass('alt');
			} else {
				container = context.querySelector(".email-signup" + "___" + variant);
			}
		} else {
			container = context.querySelector(".email-signup");
		}

		this.DOM = {
			container: container,
			button: container.querySelector(".email-signup__link"),
			loader: container.querySelector(".is-updating"),
			title: container.querySelector(".email-signup__title")
		};

		for (var key in this.DOM) {
			if (this.DOM.hasOwnProperty(key)) {
				this.DOM["$" + key] = bonzo(this.DOM[key]);
			}
		}

		if (this.DOM.container && (this.DOM.container.children && this.DOM.container.children.length > 0) && IdApi.isUserLoggedIn()) {
			this.DOM.$container.removeClass("is-hidden");
			bean.on(this.DOM.button, "click", this.requestEmailSignup.bind(this));
		}
	};

	EmailSignup.prototype.requestEmailSignup = function (event) {
		event.preventDefault();
		var self = this;

		this.DOM.$container.css("height", this.DOM.$container.css("height"));
		self.DOM.$container.addClass("loading");
		IdApi.emailSignup(self.DOM.button.getAttribute("data-list-id")).then(function success (res) {
			self.DOM.$container.removeClass("loading").addClass("done");
			if (res.status === "ok") {
				self.DOM.$button.remove();
				self.DOM.title.innerHTML = "Your subscription will be activated within 24 hours";
			} else {
				self.DOM.$button.remove();
				self.DOM.title.innerHTML = "An error occured, please reload and try again";
			}
		}, function error () {
			self.DOM.$container.removeClass("loading");
			self.DOM.$button.remove();
			self.DOM.title.innerHTML = "An error occured, please reload and try again";
		});
	};

	return EmailSignup;
});