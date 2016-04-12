package common.Logback

import conf.switches.Switches
import conf.Configuration
import play.api.{Logger => PlayLogger, Application => PlayApp, GlobalSettings, LoggerLike}


case class LogStashConf(enabled: Boolean, stream: String, region: String, role: String)

trait Logstash extends GlobalSettings {

  override def onStart(app: PlayApp) = {
    super.onStart(app)
    Logstash.init(PlayLogger) // Setup Play default Logger to send logs to logstash
  }
}

object Logstash {

  val config = for {
    stream <- Configuration.Logstash.stream
    region <- Configuration.Logstash.streamRegion
    role <- Configuration.Logstash.streamRole
  } yield {
    LogStashConf(Configuration.Logstash.enabled, stream, region, role)
  }

  def init(logger: LoggerLike) = {
    if(Switches.LogstashLogging.isSwitchedOn) {
      config.fold(logger.info("Logstash config is missing"))(LogbackConfig.initLogger(logger, _))
    } else {
      logger.info("Logstash logging switch is Off")
    }
  }
}

