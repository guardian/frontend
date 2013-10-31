package model.diagnostics

import common._
import conf.Configuration
import model.diagnostics._ 

object DiagnosticsLoadJob extends Logging {

  def run() {
    log.info("Loading diagnostics data in to CloudWatch")
    // FIXME - send all the metrics at once
    CloudWatch.put("Diagnostics", "js.osx", Metric.count("js.osx").toDouble)
    CloudWatch.put("Diagnostics", "js.android", Metric.count("js.android").toDouble)
    CloudWatch.put("Diagnostics", "js.windows", Metric.count("js.windows").toDouble)
    CloudWatch.put("Diagnostics", "js.rimos", Metric.count("js.rimos").toDouble)
    CloudWatch.put("Diagnostics", "js.linux", Metric.count("js.linux").toDouble)
    CloudWatch.put("Diagnostics", "js.unknown", Metric.count("js.unknown").toDouble)
    CloudWatch.put("Diagnostics", "ads.osx", Metric.count("ads.osx").toDouble)
    CloudWatch.put("Diagnostics", "ads.android", Metric.count("ads.android").toDouble)
    CloudWatch.put("Diagnostics", "ads.windows", Metric.count("ads.windows").toDouble)
    CloudWatch.put("Diagnostics", "ads.rimos", Metric.count("ads.rimos").toDouble)
    CloudWatch.put("Diagnostics", "ads.linux", Metric.count("ads.linux").toDouble)
    CloudWatch.put("Diagnostics", "ads.unknown", Metric.count("ads.uknown").toDouble)
  }

}
