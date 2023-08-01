This document is here to help people understand how they might run experiments, change things, and create and test new content on www.theguardian.com

## Routing

Routing to www.theguardian.com starts at Fastly. While there is a lot that happens in Fastly, from a routing perspective, it is fairly slim, and passes all requests onto our Router service, an Nginx service.

### Router

Router then matches on the URL and determines which AWS stack's [Elastic Load Balancer](https://aws.amazon.com/elasticloadbalancing/) to send the request to.

e.g. https://github.com/guardian/platform/pull/1523

### Data fetching

[`Frontend`](https://github.com/guardian/frontend) is a set of microservices based around the different things we engage with readers around on www.theguardian.com e.g.

* Articles
* Fronts
* Commercial
* Onwards journeys
* RSS
* Sport
* Other
    * Crosswords
    * Email newsletters
    * Email forms
    * Surveys (❌ deprecated)
    * Indexes (subjects and contributors)
    * Atom embeds
    * A/B testing opt in/out
    * Newspaper pages
    * Config
    * Galleries
    * Images
    * Audio
    * Video
    * Interactives
    * Pagination control

The Elastic Load Balancer will balance traffic to a set of EC2 instances that will be running your Scala app to fetch data.

If your feature or service already has a relevant app, you can add to that app's route file [e.g. for articles][article-routes-file].

You will need to ensure that the route in the router service matches that or the app routing. e.g. [Search in router][search-router] matches [Search route in app][search-app-route]

If none of the above suites your purpose, you'll need to spin up a new app

#### App bootstrap

[Here is an example of an app's bootstrap][frontend-pr].

Once the app is setup, you can fetch whatever data you want. Some things to note are

#### Each request may only perform one I/O operation on the backend.

You cannot make two calls to the content API or any other 3rd party.

This is the line in the sand set a while ago and has served us well. [There is more context here][line-in-the-sand-doc] (external).


#### Agents

Agents are pieces of code that fetch data when an app starts, and stores that data in memory so that you do not need to make multiple network requests per user request AKA not break the above line in the sand.

These are wired up by:
* Creating the agent e.g. [`MostViewedAgent`][most-viewed-agent].
* Create a lifecycle that updates the agent as often as it needs e.g. [`MostViewedLifecycle`][most-viewed-lifecycle].
* Wire up your lifecycle component to your `AppLoader.lifecycleComponents` e.g. Facia [facia-app-loader]











[app-routing]: https://github.com/guardian/frontend/pull/26056/files#diff-60894e4dc46aca859fec3dbc7caac3812f63d8e28f0998d874562a78ff712b6aR2

[search-router]: https://github.com/guardian/platform/pull/1523/files#diff-11d96444a1e1eedaaf513c2223c3936db2a1fc94c4de87e8f2f66906bd536e14R389-R390

[search-app-route]: https://github.com/guardian/frontend/pull/26056/files#diff-60894e4dc46aca859fec3dbc7caac3812f63d8e28f0998d874562a78ff712b6aR2

[article-routes-file]: https://github.com/guardian/frontend/blob/4a069adbaf96b3ee5eb8abdf9fd69f1659dfa3c0/article/conf/routes

[line-in-the-sand-doc]: https://docs.google.com/document/d/1UJKuyaSM8sR1_OeGTgsrbEB7-xuLAzpZfLWaqoc1ItY/edit

[most-viewed-agent]: https://github.com/guardian/frontend/blob/ecfa2e54a882edbc5d4fdf425111b2acbe2797ce/facia/app/agents/MostViewedAgent.scala
[most-viewed-lifecycle]: https://github.com/guardian/frontend/blob/ecfa2e54a882edbc5d4fdf425111b2acbe2797ce/facia/app/feed/MostViewedLifecycle.scala
[facia-app-loader]: https://github.com/guardian/frontend/blob/ecfa2e54a882edbc5d4fdf425111b2acbe2797ce/facia/app/AppLoader.scala

[platform-pr]: https://github.com/guardian/platform/pull/1523
[frontend-pr]: https://github.com/guardian/frontend/pull/26056
