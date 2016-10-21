import app.{FrontendComponents, LifecycleComponent}
import com.softwaremill.macwire._
import commercial.CommercialLifecycle
import common.Logback.LogstashLifecycle
import common.dfp.FaciaDfpAgentLifecycle
import conf.FootballLifecycle
import conf.switches.SwitchboardLifecycle
import contentapi.{CapiHttpClient, ContentApiClient, HttpClient}
import cricket.conf.CricketLifecycle
import feed.OnwardJourneyLifecycle
import rugby.conf.RugbyLifecycle
import services.{ConfigAgentLifecycle, OphanApi}

trait StandaloneLifecycleComponents extends SportServices with CommercialServices with FapiServices with OnwardServices {
  self: FrontendComponents =>

  //Override conflicting members
  override lazy val capiHttpClient: HttpClient = wire[CapiHttpClient]
  override lazy val contentApiClient = wire[ContentApiClient]
  override lazy val ophanApi = wire[OphanApi]

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
