package common.Logback

import ch.qos.logback.classic.spi.ILoggingEvent
import ch.qos.logback.classic.{Logger => LogbackLogger, LoggerContext}
import com.amazonaws.auth.STSAssumeRoleSessionCredentialsProvider
import com.gu.logback.appender.kinesis.KinesisAppender
import net.logstash.logback.layout.LogstashLayout
import org.slf4j.LoggerFactory
import play.api.LoggerLike
import conf.Configuration

object LogbackConfig {

  lazy val loggingContext = LoggerFactory.getILoggerFactory.asInstanceOf[LoggerContext]

  lazy val appName: String = Configuration.environment.projectName
  lazy val customFields = Map(
    "stack" -> "frontend",
    "app" -> appName,
    "stage" -> Configuration.environment.stage.toUpperCase
  )

  case class KinesisAppenderConfig(stream: String,
                                   region: String,
                                   roleArn: String,
                                   sessionName: String,
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
    a.setCredentialsProvider(new STSAssumeRoleSessionCredentialsProvider(
      appenderConfig.roleArn, appenderConfig.sessionName
    ))
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
          val layout = makeLayout(makeCustomFields(customFields))
          val bufferSize = 1000
          val appender  = makeKinesisAppender(layout, context,
            KinesisAppenderConfig(
              config.stream,
              config.region,
              config.role,
              appName,
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
