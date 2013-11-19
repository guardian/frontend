package model.diagnostics

import common._

object DiagnosticsLoadJob extends Logging {
  def run() {
    log.info("Loading diagnostics data in to CloudWatch")
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
  }

}
