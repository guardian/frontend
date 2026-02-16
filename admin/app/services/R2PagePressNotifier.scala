package services

import common.{PekkoAsync, GuLogging}
import implicits.R2PressNotification.pressMessageFormatter
import model.R2PressMessage
import play.api.libs.json.Json

import scala.concurrent.ExecutionContext

object R2PagePressNotifier extends GuLogging {

  def enqueue(pekkoAsync: PekkoAsync)(message: R2PressMessage)(implicit executionContext: ExecutionContext): String = {
    try {
      R2PressNotification.sendWithoutSubject(pekkoAsync)(Json.toJson[R2PressMessage](message).toString())
      val msg = s"Queued for pressing: ${message.url}."
      log.debug(msg)
      msg
    } catch {
      case e: Exception =>
        val msg = s"Failed to add ${message.url} to the r2 page press queue"
        log.error(msg, e)
        msg
    }
  }

}
