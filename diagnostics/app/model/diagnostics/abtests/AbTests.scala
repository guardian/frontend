package model.diagnostics.abtests

import common.Logging

object AbTests extends Logging {
  
  def report(queryString: Map[String, Seq[String]]) {
      
    val qs = queryString.collect { case (k, Seq(v)) => k -> v }

    qs.get("type") match {
      case Some("view") => increment(qs, (test, variant) => Metric.incrementPageView(test, variant))
      case Some("session") => increment( qs, (test, variant) => {
                                Metric.incrementPageView(test, variant)
                                Metric.incrementSession(test, variant)})
      case _ => {}
    }
  }

  private def increment(queryString: Map[String, String], f:(String, String) => Unit) {
    queryString.toSeq.map{ case (test, variant) => f(test, variant)}
  }
} 
