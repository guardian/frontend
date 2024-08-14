package common.Logback

import ch.qos.logback.classic.{Logger => LogbackLogger}
import org.slf4j.{LoggerFactory, Logger => SLFLogger}
import play.api.{Logger => PlayLogger}

class LogbackConfig {

  lazy val log = PlayLogger(getClass)

  def asLogBack(l: SLFLogger): Option[LogbackLogger] =
    l match {
      case l: LogbackLogger => Some(l)
      case _                => None
    }

  def init(config: LogStashConf): Unit = {
    if (config.enabled) {
      try {
        val rootLogger = LoggerFactory.getLogger(SLFLogger.ROOT_LOGGER_NAME)
        asLogBack(rootLogger).map { lb =>
          lb.info("Configuring Logback")
          lb.info("Configured Logback")
        } getOrElse log.info("not running using logback")
      } catch {
        case ex: Throwable => log.info(s"Error while adding Logback Kinesis appender: $ex")
      }
    } else {
      log.info("Logging disabled")
    }
  }

}
