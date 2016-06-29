JavaScript
==========

## Library dependencies

We use [NPM](https://www.npmjs.com) to handle our JS dependencies. Install them as a main dependency (`npm i -S module_name`), then add a ref to the configs in
- `grunt-configs/requirejs.js`
- `common/app/templates/inlineJS/blocking/curlConfig.scala.js`
- `static/test/javascripts/main.js`
- `static/test/javascripts/conf/settings.js`

## Analaytics and ad tags

Details of third-party analytics/ad tracking that are currently on the site. Please think of the children before adding more.

### Omniture

* User analytics package from Adobe.
* Implemented in [analytics/omniture.js](https://github.com/guardian/frontend/blob/master/common/app/assets/javascripts/modules/analytics/omniture.js) module.
* Log in: https://my.omniture.com/login/ Get an account from richard.wilson@guardian.co.uk
* Talk to @ahume and richard.wilson@guardian.co.uk

### Ophan

* In-house user analytics
* Implemented in the [common bootstrap](https://github.com/guardian/frontend/blob/master/common/app/assets/javascripts/bootstraps/common.js#L145) and various bits of custom tracking in video/article/etc
* Log in: dashboard.ophan.co.uk
* Talk to @ahume and @tackley

### OAS

* Ad server
* Implemented in [adverts modules](https://github.com/guardian/frontend/tree/master/common/app/assets/javascripts/modules/adverts)
* Relies on [dom-write](https://github.com/guardian/frontend/tree/master/common/app/assets/javascripts/components/dom-write) to deal with async loaded calls to `document.write`. Why did nobody think of the children?
* Talk to @ahume and danny.doyle@guardian.co.uk

### Nielsen Netratings

* Audience analysis for customer insight
* Implemented at the end of the body element in [`main.scala.html`](https://github.com/guardian/frontend/blob/master/common/app/views/main.scala.html).
* Talk to @ahume and rhiannon.griffiths@guardian.co.uk

### Audience Science

* Adds value to various advertising campaigns by passing anonymised user data back to OAS.
* Implemented as part of adverts AMD module in [`audience-science.js`](https://github.com/guardian/frontend/blob/master/common/app/assets/javascripts/modules/adverts/audience-science.js)
* Talk to @ahume and danny.doyle@guardian.co.uk
