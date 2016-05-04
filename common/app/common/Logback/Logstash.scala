package common.Logback

import com.amazonaws.auth.AWSCredentialsProvider
import common.ManifestData
import conf.switches.Switches
import conf.Configuration
import play.api.{Logger => PlayLogger, Application => PlayApp, GlobalSettings}
import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{Success, Failure}

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
    "stage" -> Configuration.environment.stage.toUpperCase,
    "build" -> ManifestData.build,
    "revision" -> ManifestData.revision
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

    Switches.LogstashLogging.isGuaranteedSwitchedOn.onComplete {
      case Success(isOn) =>
        if(isOn) {
          config.fold(PlayLogger.info("Logstash config is missing"))(LogbackConfig.init(_))
        } else {
          PlayLogger.info("Logstash logging switch is Off")
        }
      case Failure(_) => PlayLogger.error("Failed retrieving the logtash-logging switch value")
    }
  }
}

