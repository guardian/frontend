package common

import play.api.{Application, GlobalSettings}
import play.api.Mode._

object ApplicationMode {
  private var theMode = Prod
  def mode: Mode = theMode
  def setMode(theMode: Mode) = {
    this.theMode = theMode
  }
}

trait ApplicationMode extends GlobalSettings with Logging {
  override def onStart(app: Application): Unit = {
    log.info(s"Setting the application mode to ${app.mode}")
    ApplicationMode.setMode(app.mode)
  }
}
