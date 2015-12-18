package services

import common.Logging

object R2PagePressNotifier extends Logging {

  def enqueue(path: String) = {
    try {
      R2PressNotification.sendWithoutSubject(path)
    } catch {
      case e: Exception => log.error(s"Failed to add $path to the r2 page press queue", e)
    }
  }

}
