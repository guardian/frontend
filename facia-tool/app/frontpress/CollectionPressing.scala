package frontpress

import scala.concurrent.Future
import conf.Switches._
import play.api.libs.ws.Response
import services.{ContentApiWrite, ConfigAgent}
import conf.Switches

object CollectionPressing {
  def notifyContentApi(id: String): Option[Future[Response]] =
    if (ContentApiPutSwitch.isSwitchedOn)
      ConfigAgent.getConfig(id)
        .map {config => ContentApiWrite.writeToContentapi(config)}
    else None

  def pressCollectionIds(pressCommand: PressCommand): Unit =
    if (Switches.FaciaToolPressSwitch.isSwitchedOn) {
      FrontPress.press(pressCommand)
    }

  def pressAndNotify(id: String) {
    pressCollectionIds(PressCommand(Set(id), live = true, draft = true))
    notifyContentApi(id)
  }
}
