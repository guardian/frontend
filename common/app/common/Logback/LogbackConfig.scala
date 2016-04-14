package common.Logback

import ch.qos.logback.classic.spi.ILoggingEvent
import ch.qos.logback.classic.{Logger => LogbackLogger, LoggerContext}
import com.amazonaws.auth.AWSCredentialsProvider
import com.gu.logback.appender.kinesis.KinesisAppender
import net.logstash.logback.layout.LogstashLayout
import org.slf4j.LoggerFactory
import play.api.LoggerLike

object LogbackConfig {

  lazy val loggingContext = LoggerFactory.getILoggerFactory.asInstanceOf[LoggerContext]

  case class KinesisAppenderConfig(stream: String,
                                   region: String,
                                   awsCredentialsProvider: AWSCredentialsProvider,
                                   bufferSize: Int)

  def makeCustomFields(customFields: Map[String, String]): String = {
    "{" + (for((k, v) <- customFields) yield(s""""${k}":"${v}"""")).mkString(",") + "}"
  }

  def asLogBack(l: LoggerLike): Option[LogbackLogger] = l.logger match {
    case l: LogbackLogger => Some(l)
    case _ => None
  }

  def makeLayout(customFields: String) = {
    val l = new LogstashLayout()
    l.setCustomFields(customFields)
    l
  }

  def makeKinesisAppender(layout: LogstashLayout, context: LoggerContext, appenderConfig: KinesisAppenderConfig) = {
    val a = new KinesisAppender[ILoggingEvent]()
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

  def initLogger(logger: LoggerLike, config: LogStashConf) = {
    if (config.enabled) {
      asLogBack(logger).map { lb =>
        try {
          lb.info("Configuring Logback")
          val context = lb.getLoggerContext
          val layout = makeLayout(makeCustomFields(config.customFields))
          val bufferSize = 1000
          val appender  = makeKinesisAppender(layout, context,
            KinesisAppenderConfig(
              config.stream,
              config.region,
              config.awsCredentialsProvider,
              bufferSize
            )
          )
          lb.addAppender(appender)
          lb.info("Configured Logback")
        } catch {
          case ex: Throwable => logger.info(s"Error while adding Logback appender: ${ex}")
        }
      } getOrElse(logger.info("not running using logback"))
    } else {
      logger.info("Logging disabled")
    }
  }

}
