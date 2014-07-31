package model.diagnostics.analytics

import common.Logging
import java.util.concurrent.atomic.AtomicLong

object Metric extends Logging {

  case class CountMetric(namespace: String, name: String) {
    val count = new AtomicLong(0)

    override def toString = s"$namespace : $name [ ${count.get} ]"
  }

  lazy val metrics = Map(

    // video metrics
    ("vs", CountMetric("kpis", "video-starts")),                   // user has started the video
    ("ve", CountMetric("kpis", "video-ends")),                     // user has got to the end of the video
    ("vpv", CountMetric("kpis", "video-page-views")),              // user has landed on a video page
    ("vps", CountMetric("kpis", "video-preroll-start")),           // user has started the pre-roll advert
    ("vpe", CountMetric("kpis", "video-preroll-end")),             // user has ended the pre-roll advert
    ("vsap", CountMetric("kpis", "video-starts-after-preroll")),   // user has started a video after a pre-roll advert

    // page views
    ("pv", CountMetric("kpis", "page-views")),            // raw page views - simple <img> in body, no javascript involved
    ("pva", CountMetric("kpis", "analytics-page-views")), // page view fires after analytics

    // error pages
    ("50x", CountMetric("kpis", "user-50x")),             // beacon on the 50x page that tells us that real users are getting 500 errors
    ("404", CountMetric("kpis", "user-404"))              // beacon on the 404 page that tells us that real users are getting 404 not found
  )
}
