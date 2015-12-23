package services

import common.Logging

object R2PressedPageTakedownNotifier extends Logging {

  def enqueue(path: String) = {
    try {
      R2PressedPageTakedownNotification.sendWithoutSubject(path)
    } catch {
      case e: Exception => log.error(s"Failed to add $path to the r2 pressed page takedown queue", e)
    }
  }

}
