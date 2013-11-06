package model

import play.api.{Application => PlayApp, GlobalSettings}
import tools.CloudWatch

trait AdminLifecycle extends GlobalSettings {

  override def onStop(app: PlayApp) {
    CloudWatch.shutdown()
    super.onStop(app)
  }
}
