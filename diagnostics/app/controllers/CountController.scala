package controllers

import play.api.mvc.{Action, Controller}
import java.util.concurrent.atomic.AtomicLong

object CountController extends Controller {

  case class CountMetric(namespace: String, name: String) {
    val count = new AtomicLong(0)
  }

  // js, px and ad prefixes are already taken elsewhere

  lazy val metrics = Map(
    ("pv", CountMetric("kpis", "page-views")),            // raw page views - simple <img> in body, no javascript involved
    ("pva", CountMetric("kpis", "analytics-page-views"))  // page view fires after analytics
  )

  def render(prefix: String) = Action{
    val metric = metrics.get(prefix)
    metric.foreach(_.count.addAndGet(1))
    metric.map(_ => OnePix()).getOrElse(NotFound.withHeaders("Cache-Control" -> "max-age=60"))
  }

}
