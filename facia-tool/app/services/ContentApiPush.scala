package services

import common.{ExecutionContexts, Logging}
import conf.Switches._
import scala.concurrent.Future

object ContentApiPush extends Logging with ExecutionContexts {
  def notifyContentApi(ids: Set[String]) = {
    if (ContentApiPutSwitch.isSwitchedOn) {
      Future.traverse(ids) { id =>
        ConfigAgent.getConfigAfterUpdates(id).flatMap { configOption =>
          configOption.map { config =>
            ContentApiWrite.writeToContentapi(id, config)
          } getOrElse {
            Future.failed(
              new RuntimeException(s"Asked to notify content API about collection $id but did not have config " +
                s"for collection")
            )
          }
        }
      }
    } else {
      log.warn("Asked to notify content API about press command, but switch turned off.")
      Future.successful(Nil)
    }
  }
}