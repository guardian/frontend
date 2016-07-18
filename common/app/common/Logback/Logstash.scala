package common.Logback

import app.LifecycleComponent
import com.amazonaws.auth.AWSCredentialsProvider
import com.amazonaws.util.EC2MetadataUtils
import common.ManifestData
import conf.switches.Switches
import conf.Configuration
import play.api.{Logger => PlayLogger, Configuration => PlayConfiguration, Play}
import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{Success, Failure}

case class LogStashConf(enabled: Boolean,
                        stream: String,
                        region: String,
                        awsCredentialsProvider: AWSCredentialsProvider,
                        customFields: Map[String, String])

class LogstashLifecycle(playConfig: PlayConfiguration) extends LifecycleComponent {
  override def start() = {
    Logstash.init(playConfig)
  }
}

object LogstashLifecycle extends LogstashLifecycle(Play.current.configuration)

object Logstash {

  def customFields(playConfig: PlayConfiguration) = Map(
    "stack" -> "frontend",
    "app" -> playConfig.getString("guardian.projectName").getOrElse("frontend"),
    "stage" -> Configuration.environment.stage.toUpperCase,
    "build" -> ManifestData.build,
    "revision" -> ManifestData.revision,
    "ec2_instance" -> Option(EC2MetadataUtils.getInstanceId).getOrElse("Not running on ec2")
  )

  def config(playConfig: PlayConfiguration) = for {
    stream <- Configuration.Logstash.stream
    region <- Configuration.Logstash.streamRegion
  } yield {
    LogStashConf(Configuration.Logstash.enabled,
      stream,
      region,
      Configuration.aws.mandatoryCredentials,
      customFields(playConfig)
    )
  }

  def init(playConfig: PlayConfiguration): Unit = {

    Switches.LogstashLogging.isGuaranteedSwitchedOn.onComplete {
      case Success(isOn) =>
        if(isOn) {
          config(playConfig).fold(PlayLogger.info("Logstash config is missing"))(LogbackConfig.init(_))
        } else {
          PlayLogger.info("Logstash logging switch is Off")
        }
      case Failure(_) => PlayLogger.error("Failed retrieving the logtash-logging switch value")
    }
  }
}

