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
      case "PROD" => {
        CloudWatch.put("Diagnostics", Metric.averages ++ Map("views.desktop" -> R2View.count) ++ Map("viewsOverSessions.desktop" -> R2View.count / R2Session.count))
        Metric.reset()
        NextGenView.reset()
        NextGenSession.reset()
        R2View.reset()
        R2Session.reset()
      }
      case _ => log.info("DISABLED: Metrics uploaded in PROD only to limit duplication.")
    }
    
    

  }

}
