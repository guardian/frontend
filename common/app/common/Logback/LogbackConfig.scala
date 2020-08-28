package common.Logback

import ch.qos.logback.classic.spi.ILoggingEvent
import ch.qos.logback.classic.{LoggerContext, Logger => LogbackLogger}
import com.amazonaws.auth.AWSCredentialsProvider
import com.gu.logback.appender.kinesis.KinesisAppender
import net.logstash.logback.layout.LogstashLayout
import org.slf4j.{LoggerFactory, Logger => SLFLogger}
import play.api.{Logger => PlayLogger}

class LogbackConfig(logbackOperationsPool: LogbackOperationsPool) {

  lazy val loggingContext = LoggerFactory.getILoggerFactory.asInstanceOf[LoggerContext]

  case class KinesisAppenderConfig(
      stream: String,
      region: String,
      awsCredentialsProvider: AWSCredentialsProvider,
      bufferSize: Int,
  )

  def makeCustomFields(customFields: Map[String, String]): String = {
    "{" + (for ((k, v) <- customFields) yield s""""${k}":"${v}"""").mkString(",") + "}"
  }

  def asLogBack(l: SLFLogger): Option[LogbackLogger] =
    l match {
      case l: LogbackLogger => Some(l)
      case _                => None
    }

  def makeLayout(customFields: String): LogstashLayout = {
    val l = new LogstashLayout()
    l.setCustomFields(customFields)
    l
  }

  def makeKinesisAppender(
      layout: LogstashLayout,
      context: LoggerContext,
      appenderConfig: KinesisAppenderConfig,
  ): KinesisAppender[ILoggingEvent] = {
    val a = new SafeBlockingKinesisAppender(logbackOperationsPool)
    a.setName("LoggingKinesisAppender")
    a.setStreamName(appenderConfig.stream)
    a.setRegion(appenderConfig.region)
    a.setCredentialsProvider(appenderConfig.awsCredentialsProvider)
    a.setBufferSize(appenderConfig.bufferSize)

    a.setContext(context)
    a.setLayout(layout)

    layout.start()
    a.start()
    a
  }

  def init(config: LogStashConf): Unit = {
    if (config.enabled) {
      try {
        val rootLogger = LoggerFactory.getLogger(SLFLogger.ROOT_LOGGER_NAME)
        asLogBack(rootLogger).map { lb =>
          lb.info("Configuring Logback")
          val context = lb.getLoggerContext
          val layout = makeLayout(makeCustomFields(config.customFields))
          val bufferSize = 1000
          val appender = makeKinesisAppender(
            layout,
            context,
            KinesisAppenderConfig(
              config.stream,
              config.region,
              config.awsCredentialsProvider,
              bufferSize,
            ),
          )
          lb.addAppender(appender)
          lb.info("Configured Logback")
        } getOrElse PlayLogger.info("not running using logback")
      } catch {
        case ex: Throwable => PlayLogger.info(s"Error while adding Logback Kinesis appender: $ex")
      }
    } else {
      PlayLogger.info("Logging disabled")
    }
  }

}
