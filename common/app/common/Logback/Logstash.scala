package common.Logback

import com.amazonaws.auth.AWSCredentialsProvider
import conf.switches.Switches
import conf.Configuration
import play.api.{Logger => PlayLogger, Application => PlayApp, GlobalSettings}


case class LogStashConf(enabled: Boolean,
                        stream: String,
                        region: String,
                        awsCredentialsProvider: AWSCredentialsProvider,
                        customFields: Map[String, String])

trait Logstash extends GlobalSettings {

  override def onStart(app: PlayApp) = {
    super.onStart(app)
    Logstash.init
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

  def init: Unit = {
    if(Switches.LogstashLogging.isSwitchedOn) {
      config.fold(PlayLogger.info("Logstash config is missing"))(LogbackConfig.init(_))
    } else {
      PlayLogger.info("Logstash logging switch is Off")
    }
  }
}

