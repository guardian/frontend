package model.diagnostics

import common._
import conf.Switches._

object DiagnosticsLoadJob extends Logging {
  def run() {

    log.info("Loading diagnostics data in to CloudWatch")

    if (AdDwellTimeLoggerSwitch.isSwitchedOn) {
      log.info(s"ads.top.count:${Top.count}")
      log.info(s"ads.top.secondsInView:${Top.secondsInView}")
      log.info(s"ads.bottom.count:${Bottom.count}")
      log.info(s"ads.bottom.secondsInView:${Bottom.secondsInView}")
    }

    CloudWatch.put( "Diagnostics", Metric.averages ++ Map(
                    ("views.desktop", DesktopView.count),
                    ("viewsOverSessions.desktop", DesktopView.count / DesktopSession.count),
                    ("views.responsive", ResponsiveView.count),
                    ("viewsOverSessions.responsive", ResponsiveView.count / ResponsiveSession.count),
                    ("ads.top.count", Top.count),
                    ("ads.top.secondsInView", Top.secondsInView),
                    ("ads.bottom.count", Bottom.count),
                    ("ads.bottom.secondsInView", Bottom.secondsInView)
                  ))


    Metric.reset()
    ResponsiveView.reset()
    ResponsiveSession.reset()
    DesktopView.reset()
    DesktopSession.reset()
    Top.reset()
    Bottom.reset()
  }

}
