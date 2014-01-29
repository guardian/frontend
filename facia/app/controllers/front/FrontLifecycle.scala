package controllers.front

import common.{AkkaAsync, Jobs}
import play.api.GlobalSettings
import scala.concurrent.duration._

trait FrontLifecycle extends GlobalSettings {
  override def onStart(app: play.api.Application) {
    super.onStart(app)
  }

  override def onStop(app: play.api.Application) {
    super.onStop(app)
  }
}
