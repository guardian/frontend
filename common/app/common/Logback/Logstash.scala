package common.Logback

import com.amazonaws.auth.AWSCredentialsProvider
import conf.switches.Switches
import conf.Configuration
import play.api.{Logger => PlayLogger, Application => PlayApp, GlobalSettings, LoggerLike}


case class LogStashConf(enabled: Boolean,
                        stream: String,
                        region: String,
                        awsCredentialsProvider: AWSCredentialsProvider,
                        customFields: Map[String, String])

trait Logstash extends GlobalSettings {

  override def onStart(app: PlayApp) = {
    super.onStart(app)
    Logstash.init(PlayLogger) // Setup Play default Logger to send logs to logstash
  }
}

object Logstash {

  val customFields = Map(
    "stack" -> "frontend",
    "app" -> Configuration.environment.projectName,
    "stage" -> Configuration.environment.stage.toUpperCase
  )

  val config = for {
    stream <- Configuration.Logstash.stream
    region <- Configuration.Logstash.streamRegion
  } yield {
    LogStashConf(Configuration.Logstash.enabled,
      stream,
      region,
      Configuration.aws.mandatoryCredentials,
      customFields
    )
  }

  def init(logger: LoggerLike): Unit = {
    if(Switches.LogstashLogging.isSwitchedOn) {
      config.fold(logger.info("Logstash config is missing"))(LogbackConfig.initLogger(logger, _))
    } else {
      logger.info("Logstash logging switch is Off")
    }
  }
}

