package services

import common.{AkkaAsync, Logging}

import scala.concurrent.ExecutionContext

object R2PressedPageTakedownNotifier extends Logging {

  def enqueue(akkaAsync: AkkaAsync)(path: String)(implicit executionContext: ExecutionContext): String = {
    try {
      R2PressedPageTakedownNotification.sendWithoutSubject(akkaAsync)(path)
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
