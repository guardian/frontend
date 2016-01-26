package model.diagnostics.analytics

import java.util.concurrent.atomic.AtomicLong

import common.Logging
import conf.switches.Switches

object Metric extends Logging {

  case class CountMetric(name: String) {
    val count = new AtomicLong(0)
  }

  lazy val namespace = "Diagnostics"

  lazy val metrics = Map(

    // page views
    ("pv", CountMetric("kpis-page-views")),            // raw page views - simple <img> in body, no javascript involved
    ("pva", CountMetric("kpis-analytics-page-views")), // page view fires after analytics
    ("omniture-library-error", CountMetric("omniture-library-error")),
    ("omniture-pageview-error", CountMetric("omniture-pageview-error")),

    ("ads-blocked", CountMetric("ads-blocked")),
    ("ad-render", CountMetric("first-ad-rendered")),
    ("ad-wrapper", CountMetric("dfp-served-ad")),

    // error pages
    ("50x", CountMetric("kpis-user-50x")),             // beacon on the 50x page that tells us that real users are getting 500 errors
    ("404", CountMetric("kpis-user-404")),             // beacon on the 404 page that tells us that real users are getting 404 not found

    // video
    ("video-tech-flash", CountMetric("video-tech-flash")),
    ("video-tech-html5", CountMetric("video-tech-html5")),

    ("sm-page-view", CountMetric("sm-page-view")),
    ("sm-interaction-on-same-page", CountMetric("sm-interaction-on-same-page")),
    ("sm-another-guardian-page", CountMetric("sm-another-guardian-page")),
    ("sm-clicked-related-content", CountMetric("sm-clicked-related-content")),
    ("sm-clicked-series-component", CountMetric("sm-clicked-series-component")),
    ("sm-clicked-most-popular-component", CountMetric("sm-clicked-most-popular-component")),

    ("ipad-old-start", CountMetric(s"ipad-old-start")),
    ("ipad-old-after-5", CountMetric(s"ipad-old-after-5")),
    ("ipad-old-after-10", CountMetric(s"ipad-old-after-10")),
    ("ipad-old-after-60", CountMetric(s"ipad-old-after-60")),

    ("ipad-2orMini-start", CountMetric(s"ipad-2orMini-start")),
    ("ipad-2orMini-after-5", CountMetric(s"ipad-2orMini-after-5")),
    ("ipad-2orMini-after-10", CountMetric(s"ipad-2orMini-after-10")),
    ("ipad-2orMini-after-60", CountMetric(s"ipad-2orMini-after-60")),

    ("ipad-retina-core-opted-in-start", CountMetric(s"ipad-retina-core-opted-in-start")),
    ("ipad-retina-core-opted-in-after-5", CountMetric(s"ipad-retina-core-opted-in-after-5")),
    ("ipad-retina-core-opted-in-after-10", CountMetric(s"ipad-retina-core-opted-in-after-10")),
    ("ipad-retina-core-opted-in-after-60", CountMetric(s"ipad-retina-core-opted-in-after-60")),

    ("ipad-retina-universal-fronts-start", CountMetric(s"ipad-retina-universal-fronts-start")),
    ("ipad-retina-universal-fronts-after-5", CountMetric(s"ipad-retina-universal-fronts-after-5")),
    ("ipad-retina-universal-fronts-after-10", CountMetric(s"ipad-retina-universal-fronts-after-10")),
    ("ipad-retina-universal-fronts-after-60", CountMetric(s"ipad-retina-universal-fronts-after-60")),

    ("android-nexus5-start", CountMetric(s"android-nexus5-start")),
    ("android-nexus5-after-5", CountMetric(s"android-nexus5-after-5")),
    ("windows7-chrome-start", CountMetric(s"windows7-chrome-start")),
    ("windows7-chrome-after-5", CountMetric(s"windows7-chrome-after-5")),

    ("headlines-variant-seen", CountMetric(s"headlines-variant-seen")),
    ("headlines-control-seen", CountMetric(s"headlines-control-seen")),
    ("headlines-variant-clicked", CountMetric(s"headlines-variant-clicked")),
    ("headlines-control-clicked", CountMetric(s"headlines-control-clicked")),

    ("tech-feedback", CountMetric("tech-feedback")),

    //counts http proxy errors when submitting comments
    ("comment-http-proxy-error", CountMetric("comment-http-proxy-error")),
    ("comment-error", CountMetric("comment-error")),
    ("comment-post-success", CountMetric("comment-post-success"))
  ) ++ iPhoneMetrics

  private val iPhoneMetrics: Seq[(String, CountMetric)] = Seq(4, 6).flatMap( model =>
    Seq(
      s"iphone-$model-start" -> CountMetric(s"iphone-$model-start"),
      s"iphone-$model-after-5" -> CountMetric(s"iphone-$model-after-5"),
      s"iphone-$model-after-10" -> CountMetric(s"iphone-$model-after-10"),
      s"iphone-$model-after-60" -> CountMetric(s"iphone-$model-after-60")
    )
  )

  //just here so that when you delete this you see this comment and delete the 'iphone' metrics above
  private lazy val deleteIphoneMetrics = conf.switches.Switches.IphoneConfidence.isSwitchedOn
}
