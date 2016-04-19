package common

import play.api.Logger
import org.apache.commons.lang.exception.ExceptionUtils

trait Logging {

  lazy implicit val log = Logger(getClass)

  protected def logException(e: Exception) = {
    log.error(ExceptionUtils.getStackTrace(e))
  }
}
