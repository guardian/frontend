import commercial.CommercialLifecycle
import common.dfp.FaciaDfpAgentLifecycle
import common.{CanonicalLink, DiagnosticsLifecycle, ExecutionContexts}
import conf._
import conf.switches.SwitchboardLifecycle
import contentapi.SectionsLookUpLifecycle
import dfp.DfpDataCacheLifecycle
import feed.{MostPopularFacebookAutoRefreshLifecycle, MostReadLifecycle, OnwardJourneyLifecycle}
import implicits.Requests
import model.AdminLifecycle
import ophan.SurgingContentAgentLifecycle
import play.api.mvc.{EssentialAction, EssentialFilter, RequestHeader, WithFilters}
import rugby.conf.RugbyLifecycle
import services.ConfigAgentLifecycle
import headlines.ABHeadlinesLifecycle


object Global extends AdminLifecycle
  with DiagnosticsLifecycle
  with OnwardJourneyLifecycle
  with CommercialLifecycle
  with MostReadLifecycle
  with DfpDataCacheLifecycle
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
}
