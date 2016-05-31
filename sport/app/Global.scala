import common.CloudWatchApplicationMetrics
import common.Logback.Logstash
import conf._
import conf.switches.SwitchboardLifecycle
import ophan.SurgingContentAgentLifecycle
import rugby.conf.RugbyLifecycle

object Global extends CloudWatchApplicationMetrics
  with SurgingContentAgentLifecycle
  with SwitchboardLifecycle
  with FootballLifecycle
  with CricketLifecycle
  with RugbyLifecycle
  with Logstash
  with SportHealthCheckLifeCycle {
  override lazy val applicationName = "frontend-sport"
}
