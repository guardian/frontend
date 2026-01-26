package services

import common.{PekkoAsync, GuLogging}

import scala.concurrent.ExecutionContext

object R2PressedPageTakedownNotifier extends GuLogging {

  def enqueue(pekkoAsync: PekkoAsync)(path: String)(implicit executionContext: ExecutionContext): String = {
    try {
      R2PressedPageTakedownNotification.sendWithoutSubject(pekkoAsync)(path)
      val msg = s"Queued for takedown: $path"
      log.info(msg)
      msg
    } catch {
      case e: Exception =>
        val msg = s"Failed to add $path to the r2 pressed page takedown queue"
        log.error(msg, e)
        msg
    }
  }

}
