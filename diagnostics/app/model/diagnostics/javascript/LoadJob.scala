package model.diagnostics.javascript

import common._
import conf.Switches._
import model.diagnostics.CloudWatch

object LoadJob extends Logging {
  def run() {
    log.info("Loading javascript error diagnostics data in to CloudWatch")
    CloudWatch.put( "Diagnostics", Metric.averages)
    Metric.reset()
  }

}
