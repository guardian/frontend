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
    ("iphone-4-start", CountMetric("iphone-4-start")),
    ("iphone-4-end", CountMetric("iphone-4-end")),
    ("iphone-4-timeout", CountMetric("iphone-4-timeout"))
  )

  //just here so that when you delete this you see this comment and delete the 'iphone' metrics above
  private lazy val deleteIphoneMetrics = conf.Switches.IphoneConfidence.isSwitchedOn
}
