import common.CloudWatchApplicationMetrics
import common.Logback.Logstash
import conf._
import dev.DevParametersLifecycle
import ophan.SurgingContentAgentLifecycle
import rugby.conf.RugbyLifecycle

object Global extends DevParametersLifecycle
  with CloudWatchApplicationMetrics
  with SurgingContentAgentLifecycle
  with SwitchboardLifecycle
  with FootballLifecycle
  with CricketLifecycle
  with RugbyLifecycle
  with CorsErrorHandler
  with Logstash
  with SportHealthCheckLifeCycle {
  override lazy val applicationName = "frontend-sport"
}
