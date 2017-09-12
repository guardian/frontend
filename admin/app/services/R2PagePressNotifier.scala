package services

import common.{AkkaAsync, Logging}
import implicits.R2PressNotification.pressMessageFormatter
import model.R2PressMessage
import play.api.libs.json.Json

import scala.concurrent.ExecutionContext

object R2PagePressNotifier extends Logging {

  def enqueue(akkaAsync: AkkaAsync)(message: R2PressMessage)(implicit executionContext: ExecutionContext): String = {
    try {
      R2PressNotification.sendWithoutSubject(akkaAsync)(Json.toJson[R2PressMessage](message).toString())
      val msg = s"Queued for pressing: ${message.url} (from preserved source: ${message.fromPreservedSrc})"
      log.info(msg)
      msg
    } catch {
      case e: Exception =>
        val msg = s"Failed to add ${message.url} to the r2 page press queue"
        log.error(msg, e)
        msg
    }
  }

}
