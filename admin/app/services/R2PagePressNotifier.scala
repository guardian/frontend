package services

import common.Logging

object R2PagePressNotifier extends Logging {

  def enqueue(path: String): String = {
    try {
      R2PressNotification.sendWithoutSubject(path)
      val msg = s"Queued for pressing: $path"
      log.info(msg)
      msg
    } catch {
      case e: Exception => {
        val msg = s"Failed to add $path to the r2 page press queue"
        log.error(msg, e)
        msg
      }
    }
  }

}
