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
        CloudWatch.put( "Diagnostics", Metric.averages ++ Map(
                        "views.desktop" -> DesktopView.count,
                        "viewsOverSessions.desktop" -> DesktopView.count / DesktopSession.count,
                        "views.responsive" -> ResponsiveView.count,
                        "viewsOverSessions.responsive" -> ResponsiveView.count / ResponsiveSession.count))
        Metric.reset()
        ResponsiveView.reset()
        ResponsiveSession.reset()
        DesktopView.reset()
        DesktopSession.reset()
      }
      case _ => log.info("DISABLED: Metrics uploaded in PROD only to limit duplication.")
    }
    
    

  }

}
