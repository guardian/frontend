package model.diagnostics

import common._
import conf.Configuration
import model.diagnostics._ 

object DiagnosticsLoadJob extends Logging {

  def run() {
    
    log.info("Loading diagnostics data in to CloudWatch")
    Configuration.environment.stage.toUpperCase match {
      case "PROD" => CloudWatch.put("Diagnostics", Metric.all)
      case _ => log.info("DISABLED: Metrics uploaded in PROD only to limit duplication.")
    }
    
    

  }

}
