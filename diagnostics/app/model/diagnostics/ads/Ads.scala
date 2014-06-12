package model.diagnostics.ads

import common.Logging
import diagnostics.RequestQuery
import play.api.mvc.RequestHeader

object Ads extends Logging {

  def report(request: RequestHeader) {
    val query = RequestQuery(request)
    query.queryString.get("type") match {
      case Some("renderTime") => query.queryString.get("value").map { value =>
        Metric.increment("renderTime", value.toInt)
      }
      case _ => {}
    }
  }

} 
