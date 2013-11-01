package model.diagnostics

import common._
import conf.Configuration
import model.diagnostics._ 
import scala.concurrent._
import ExecutionContext.Implicits.global

object DiagnosticsLoadJob extends Logging {

  def run() {
    
    log.info("Loading diagnostics data in to CloudWatch")
    Configuration.environment.stage.toUpperCase match {
      case "DEV" => {
        val cwFuture = CloudWatch.put("Diagnostics", Metric.all)
        val f: scala.concurrent.Future[java.util.concurrent.Future[Void]] = future {
          Metric.reset
          cwFuture
        }
      }
      case _ => log.info("DISABLED: Metrics uploaded in PROD only to limit duplication.")
    }
    
    

  }

}
