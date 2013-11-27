package model.diagnostics.alpha

import common._
import conf.Switches._
import model.diagnostics.CloudWatch

object LoadJob extends Logging {
  def run() {

    log.info("Loading alpha diagnostics data in to CloudWatch")
      
    //log.info(s"views.desktop:${DesktopView.count}")
    //log.info(s"views.desktop:${DesktopSession.count}")
    
    CloudWatch.put( "Diagnostics", Map(
                    ("views.desktop", DesktopView.count),
                    ("viewsOverSessions.desktop", DesktopView.count / DesktopSession.count),
                    ("views.responsive", ResponsiveView.count),
                    ("viewsOverSessions.responsive", ResponsiveView.count / ResponsiveSession.count)
                  ))

    ResponsiveView.reset()
    ResponsiveSession.reset()
    DesktopView.reset()
    DesktopSession.reset()
  }

}
