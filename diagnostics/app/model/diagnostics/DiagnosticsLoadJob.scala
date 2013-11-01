package model.diagnostics

import common._
import conf.Configuration
import model.diagnostics._ 

object DiagnosticsLoadJob extends Logging {

  def run() {
    
    /*log.info("Uploading %d new metric data points" format fresh.size)
        Configuration.environment.stage.toUpperCase match {
                case "PROD" => CloudWatch.put("Fastly", fresh)
    case _ => log.info("DISABLED: Metrics uploaded in PROD only to limit duplication.")
        }*/

    log.info("Loading diagnostics data in to CloudWatch")
    CloudWatch.put("Diagnostics", Metric.all)

  }

}
