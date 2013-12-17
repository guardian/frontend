define([
    "bean",
    "bonzo",
    "utils/ajax",
    "modules/identity/api"
], function(bean, bonzo, ajax, IdApi) {
	return {
		
		init: function (context) {
			this.container = context.querySelector('.email-signup');
			this.button = this.container.querySelector('.email-signup__link');
			this.loader = this.container.querySelector('.is-updating');
			if (this.button && IdApi.isUserLoggedIn()) {
				bonzo(this.container).removeClass("u-h");
				bonzo(this.container).css('height', bonzo(this.container).css('height'));
				bean.on(this.button, 'click', this.requestEmailSignup.bind(this));
			}
		},

		requestEmailSignup: function (event) {
			event.preventDefault();
			
			var self = this;
			bonzo(this.container).addClass("loading");
			IdApi.emailSignup(self.button.getAttribute("data-list-id")).then(function success (res) {
				bonzo(self.container).removeClass("loading").addClass("done");
				if (res.status === 'ok') {
					self.button.innerHTML = "Your subscription will be activated within 24 hours";
				} else {
					self.button.innerHTML = "An error occured, please try again";
				}
			}, function error () {
				bonzo(this.container).removeClass("loading");
				self.button.innerHTML = "An error occured, please try again";
			});
		}

	};
});