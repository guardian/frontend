package model.diagnostics.analytics

import java.util.concurrent.atomic.AtomicLong

import common.Logging
import conf.Switches

object Metric extends Logging {

  case class CountMetric(name: String) {
    val count = new AtomicLong(0)
  }

  lazy val namespace = "Diagnostics"

  // TODO delete bounce-test-present when this goes
  import conf.Switches.NoBounceIndicator

  lazy val metrics = Map(

    // page views
    ("pv", CountMetric("kpis-page-views")),            // raw page views - simple <img> in body, no javascript involved
    ("pva", CountMetric("kpis-analytics-page-views")), // page view fires after analytics
    ("user-navigated-early", CountMetric("user-navigated-early")),

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
    ("ipad-2orMini-start", CountMetric(s"ipad-2orMini-start")),
    ("ipad-2orMini-after-5", CountMetric(s"ipad-2orMini-after-5")),
    ("ipad-3orLater-start", CountMetric(s"ipad-3orLater-start")),
    ("ipad-3orLater-after-5", CountMetric(s"ipad-3orLater-after-5")),
    ("android-nexus5-start", CountMetric(s"android-nexus5-start")),
    ("android-nexus5-after-5", CountMetric(s"android-nexus5-after-5")),
    ("windows7-chrome-start", CountMetric(s"windows7-chrome-start")),
    ("windows7-chrome-after-5", CountMetric(s"windows7-chrome-after-5")),

    // temporarily count use of RAF for LoadCSSRafTest
    ("ipad-old-start-raf", CountMetric(s"ipad-old-start-raf")),
    ("ipad-old-after-5-raf", CountMetric(s"ipad-old-after-5-raf")),
    ("ipad-2orMini-start-raf", CountMetric(s"ipad-2orMini-start-raf")),
    ("ipad-2orMini-after-5-raf", CountMetric(s"ipad-2orMini-after-5-raf")),
    ("ipad-3orLater-start-raf", CountMetric(s"ipad-3orLater-start-raf")),
    ("ipad-3orLater-after-5-raf", CountMetric(s"ipad-3orLater-after-5-raf")),
    ("android-nexus5-start-raf", CountMetric(s"android-nexus5-start-raf")),
    ("android-nexus5-after-5-raf", CountMetric(s"android-nexus5-after-5-raf")),
    ("android-nexus7-start-raf", CountMetric(s"android-nexus7-start-raf")),
    ("android-nexus7-after-5-raf", CountMetric(s"android-nexus7-after-5-raf")),
    ("android-sgs4-start-raf", CountMetric(s"android-sgs4-start-raf")),
    ("android-sgs4-after-5-raf", CountMetric(s"android-sgs4-after-5-raf")),
    ("android-sgs3-start-raf", CountMetric(s"android-sgs3-start-raf")),
    ("android-sgs3-after-5-raf", CountMetric(s"android-sgs3-after-5-raf")),


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
      s"iphone-$model-start-raf" -> CountMetric(s"iphone-$model-start-raf"),
      s"iphone-$model-after-5-raf" -> CountMetric(s"iphone-$model-after-5-raf")
    )
  )

  //just here so that when you delete this you see this comment and delete the 'iphone' metrics above
  private lazy val deleteIphoneMetrics = conf.Switches.IphoneConfidence.isSwitchedOn
}
