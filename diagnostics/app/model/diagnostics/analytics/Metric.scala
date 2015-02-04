package model.diagnostics.analytics

import java.util.concurrent.atomic.AtomicLong

import common.Logging

object Metric extends Logging {

  case class CountMetric(name: String) {
    val count = new AtomicLong(0)
  }

  lazy val namespace = "Diagnostics"

  lazy val metrics = Map(

    // page views
    ("pv", CountMetric("kpis-page-views")),            // raw page views - simple <img> in body, no javascript involved
    ("pva", CountMetric("kpis-analytics-page-views")), // page view fires after analytics

    ("ads-blocked", CountMetric("ads-blocked")),

    // error pages
    ("50x", CountMetric("kpis-user-50x")),             // beacon on the 50x page that tells us that real users are getting 500 errors
    ("404", CountMetric("kpis-user-404")),             // beacon on the 404 page that tells us that real users are getting 404 not found

    // video
    ("video-tech-flash", CountMetric("video-tech-flash")),
    ("video-tech-html5", CountMetric("video-tech-html5")),

    ("iphone-6-start", CountMetric("iphone-6-start")),
    ("iphone-6-end", CountMetric("iphone-6-end")),
    ("iphone-6-timeout", CountMetric("iphone-6-timeout")),

    ("iphone-4-start-a", CountMetric("iphone-4-start-a")),
    ("iphone-4-end-a", CountMetric("iphone-4-end-a")),
    ("iphone-4-timeout-a", CountMetric("iphone-4-timeout-a")),

    ("iphone-4-start-b", CountMetric("iphone-4-start-b")),
    ("iphone-4-end-b", CountMetric("iphone-4-end-b")),
    ("iphone-4-timeout-b", CountMetric("iphone-4-timeout-b")),


    ("dnt", CountMetric("do-not-track")),

    ("sm-page-view", CountMetric("sm-page-view")),
    ("sm-interaction-on-same-page", CountMetric("sm-interaction-on-same-page")),
    ("sm-another-guardian-page", CountMetric("sm-another-guardian-page")),
    ("sm-clicked-related-content", CountMetric("sm-clicked-related-content")),
    ("sm-clicked-series-component", CountMetric("sm-clicked-series-component"))
  )

  //just here so that when you delete this you see this comment and delete the 'iphone' metrics above
  private lazy val deleteIphoneMetrics = conf.Switches.IphoneConfidence.isSwitchedOn
}
