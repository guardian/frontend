package model.diagnostics

import common._
import conf.Configuration
import model.diagnostics._ 

object DiagnosticsLoadJob extends Logging {

  def run() {
    log.info("Loading diagnostics data in to CloudWatch")
    CloudWatch.put("Diagnostics", Metric.count("foo").toDouble)
  }

}
