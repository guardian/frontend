package common

import play.api.Logger
import org.apache.commons.lang.exception.ExceptionUtils
import common.Logback.Logstash

trait Logging {

  lazy implicit val log = {
    val logger = Logger(getClass)
    Logstash.init(logger) // Setup logger to send logs to logstash
    logger
  }
  protected def logException(e: Exception) = {
    log.error(ExceptionUtils.getStackTrace(e))
  }
}
