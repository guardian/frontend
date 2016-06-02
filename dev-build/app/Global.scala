import commercial.CommercialLifecycle
import dfp.DfpDataCacheLifecycle
import common.dfp.FaciaDfpAgentLifecycle
import common._
import conf._
import conf.switches.SwitchboardLifecycle
import contentapi.SectionsLookUpLifecycle
import cricket.conf.CricketLifecycle
import feed.{MostPopularFacebookAutoRefreshLifecycle, MostReadLifecycle, OnwardJourneyLifecycle}
import model.AdminLifecycle
import ophan.SurgingContentAgentLifecycle
import play.api.GlobalSettings
import play.api.inject.ApplicationLifecycle
import rugby.conf.RugbyLifecycle
import services.ConfigAgentLifecycle
import headlines.ABHeadlinesLifecycle

import scala.concurrent.ExecutionContext

object Global extends GlobalSettings with BackwardCompatibleLifecycleComponents
  with FaciaDfpAgentLifecycle
  with ConfigAgentLifecycle
  with SurgingContentAgentLifecycle
  with SectionsLookUpLifecycle
  with SwitchboardLifecycle
  with ABHeadlinesLifecycle {

  override def lifecycleComponents(appLifecycle: ApplicationLifecycle)(implicit ec: ExecutionContext): List[LifecycleComponent] = List(
    new AdminLifecycle(appLifecycle),
    new DiagnosticsLifecycle(appLifecycle),
    new OnwardJourneyLifecycle(appLifecycle),
    new CommercialLifecycle(appLifecycle),
    new MostReadLifecycle(appLifecycle),
    new DfpDataCacheLifecycle(appLifecycle),
    new MostPopularFacebookAutoRefreshLifecycle(appLifecycle),
    new FootballLifecycle(appLifecycle),
    new CricketLifecycle(appLifecycle),
    new RugbyLifecycle(appLifecycle)
  )
}
