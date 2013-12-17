define([
    "bean",
    "bonzo",
    "utils/ajax",
    "modules/identity/api"
], function(bean, bonzo, ajax, IdApi) {
	return {
		
		init: function (context, variant) {

			var container = context.querySelector('.email-signup'+'___'+variant);
			
			this.DOM = {
				container: container,
				button: container.querySelector('.email-signup__link'),
				loader: container.querySelector('.is-updating'),
				title: container.querySelector('.email-signup__title')
			};

			for (var key in this.DOM) {
				if (this.DOM.hasOwnProperty(key)) {
					this.DOM['$'+key] = bonzo(this.DOM[key]);
				}
			}

			if (this.DOM.container && IdApi.isUserLoggedIn()) {
				this.DOM.$container.removeClass("u-h");
				this.DOM.$container.css('height', this.DOM.$container.css('height'));
				bean.on(this.DOM.button, 'click', this.requestEmailSignup.bind(this));
			}
		},

		requestEmailSignup: function (event) {
			event.preventDefault();
			var self = this;
			
			self.DOM.$container.addClass("loading");
			IdApi.emailSignup(self.DOM.button.getAttribute("data-list-id")).then(function success (res) {
				self.DOM.$container.removeClass("loading").addClass("done");
				if (res.status === 'ok') {
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
		}

	};
});