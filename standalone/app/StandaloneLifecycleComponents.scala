import app.{LifecycleComponent, FrontendComponents}
import com.softwaremill.macwire._
import commercial.CommercialLifecycle
import common.Logback.LogstashLifecycle
import common.dfp.FaciaDfpAgentLifecycle
import conf.FootballLifecycle
import conf.switches.SwitchboardLifecycle
import cricket.conf.CricketLifecycle
import feed.OnwardJourneyLifecycle
import rugby.conf.RugbyLifecycle
import services.ConfigAgentLifecycle

trait StandaloneLifecycleComponents extends CricketServices {
  self: FrontendComponents =>
  def standaloneLifecycleComponents: List[LifecycleComponent] = List(
    wire[LogstashLifecycle],
    wire[CommercialLifecycle],
    wire[OnwardJourneyLifecycle],
    wire[ConfigAgentLifecycle],
    wire[FaciaDfpAgentLifecycle],
    wire[SwitchboardLifecycle],
    wire[FootballLifecycle],
    wire[CricketLifecycle],
    wire[RugbyLifecycle]
  )
}
