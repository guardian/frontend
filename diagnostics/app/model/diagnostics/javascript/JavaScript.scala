package model.diagnostics.javascript 

import common.Logging
import diagnostics.RequestQuery
import play.api.mvc.RequestHeader

object JavaScript extends Logging {

  def report(request: RequestHeader) {

      val query = RequestQuery(request)

      if (query.queryString.contains("type") && !query.isHealthCheck) {
        
        query.queryString.get("type") match {
          case Some("js") => Metric.increment(s"js.${query.osFamily}")
          case Some("ads") => Metric.increment("ads") 
          case _ => {}
        }
      }
    }
} 
