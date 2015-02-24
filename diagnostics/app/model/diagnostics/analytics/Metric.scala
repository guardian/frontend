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

    ("dnt", CountMetric("do-not-track")),

    ("sm-page-view", CountMetric("sm-page-view")),
    ("sm-interaction-on-same-page", CountMetric("sm-interaction-on-same-page")),
    ("sm-another-guardian-page", CountMetric("sm-another-guardian-page")),
    ("sm-clicked-related-content", CountMetric("sm-clicked-related-content")),
    ("sm-clicked-series-component", CountMetric("sm-clicked-series-component")),
    ("sm-clicked-most-popular-component", CountMetric("sm-clicked-most-popular-component")),

    ("ipad-old-start", CountMetric(s"ipad-old-start")),
    ("ipad-old-after-5", CountMetric(s"ipad-old-after-5"))
  ) ++ iPhoneMetrics

  private val iPhoneMetrics: Seq[(String, CountMetric)] = Seq(4, 6).flatMap( model =>
    Seq(
      s"iphone-$model-start" -> CountMetric(s"iphone-$model-start"),
      s"iphone-$model-after-5" -> CountMetric(s"iphone-$model-after-5")
    )
  )

  //just here so that when you delete this you see this comment and delete the 'iphone' metrics above
  private lazy val deleteIphoneMetrics = conf.Switches.IphoneConfidence.isSwitchedOn
}
