package frontpress

import jobs.FrontPressJob
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

  def pressCollectionId(id: String): Unit = pressCollectionIds(Set(id))
  def pressCollectionIds(ids: Set[String]): Unit =
    if (Switches.FaciaToolPressSwitch.isSwitchedOn) {
      FrontPressJob.pressByCollectionIds(ids)
    }

  def pressAndNotify(id: String) {
    pressCollectionId(id)
    notifyContentApi(id)
  }
}
