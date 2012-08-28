package controllers

import java.util.concurrent.TimeoutException
import play.api.Logger

object `package` {

  def timeoutQuietly[A](block: () => A)(implicit log: Logger): Option[A] = try {
    Some(block())
  } catch {
    case t: TimeoutException =>
      log.info("timeout", t)
      None
  }

}
