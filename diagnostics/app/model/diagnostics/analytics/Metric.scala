package model.diagnostics.analytics

import common.Logging
import metrics.CountMetric

object Metric extends Logging {

  val namespace = "Diagnostics"

  lazy val metrics = Map(

    // page views
    ("pv", CountMetric("kpis-page-views", "raw page views - simple <img> in body, no javascript involved")),
    ("pvg", CountMetric("kpis-analytics-page-views-google", "page view fires after Google Analytics")),

    ("ads-blocked", CountMetric("ads-blocked", "ads-blocked")),
    ("ad-render", CountMetric("first-ad-rendered", "first-ad-rendered")),
    ("ad-wrapper", CountMetric("dfp-served-ad", "dfp-served-ad")),

    // Commercial audit
    ("comm-audit-alpha", CountMetric("comm-audit-alpha", "Variant Alpha of ad serve audit")),
    ("comm-audit-beta", CountMetric("comm-audit-beta", "Variant Beta of ad serve audit")),
    ("comm-audit-delta", CountMetric("comm-audit-delta", "Variant Delta of ad serve audit")),

    // error pages
    ("50x", CountMetric("kpis-user-50x", "beacon on the 50x page that tells us that real users are getting 500 errors")),
    ("404", CountMetric("kpis-user-404", "beacon on the 404 page that tells us that real users are getting 404 not found")),

    ("headlines-variant-seen", CountMetric(s"headlines-variant-seen", s"headlines-variant-seen")),
    ("headlines-control-seen", CountMetric(s"headlines-control-seen", s"headlines-control-seen")),
    ("headlines-variant-clicked", CountMetric(s"headlines-variant-clicked", s"headlines-variant-clicked")),
    ("headlines-control-clicked", CountMetric(s"headlines-control-clicked", s"headlines-control-clicked")),

    //counts http proxy errors when submitting comments
    ("comment-http-proxy-error", CountMetric("comment-http-proxy-error", "comment-http-proxy-error")),
    ("comment-error", CountMetric("comment-error", "comment-error")),
    ("comment-post-success", CountMetric("comment-post-success", "comment-post-success"))
  )
}
