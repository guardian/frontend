import commercial.CommercialLifecycle
import common.dfp.FaciaDfpAgentLifecycle
import common._
import conf._
import conf.switches.SwitchboardLifecycle
import contentapi.SectionsLookUpLifecycle
import _root_.dfp.DfpDataCacheLifecycle
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
  with DiagnosticsLifecycle
  with OnwardJourneyLifecycle
  with MostReadLifecycle
  with FaciaDfpAgentLifecycle
  with ConfigAgentLifecycle
  with SurgingContentAgentLifecycle
  with SectionsLookUpLifecycle
  with MostPopularFacebookAutoRefreshLifecycle
  with SwitchboardLifecycle
  with FootballLifecycle
  with CricketLifecycle
  with RugbyLifecycle
  with ABHeadlinesLifecycle {

  override def lifecycleComponents(appLifecycle: ApplicationLifecycle)(implicit ec: ExecutionContext): List[LifecycleComponent] = List(
    new AdminLifecycle(appLifecycle)(ec),
    new CommercialLifecycle(appLifecycle)(ec),
    new DfpDataCacheLifecycle(appLifecycle)(ec)
  )
}
