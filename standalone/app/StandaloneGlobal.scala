import com.gu.googleauth.{FilterExemption, UserIdentity}
import commercial.CommercialLifecycle
import common.{LifecycleComponent, BackwardCompatibleLifecycleComponents}
import common.Logback.Logstash
import common.dfp.FaciaDfpAgentLifecycle
import conf._
import conf.switches.SwitchboardLifecycle
import controllers.AuthCookie
import feed.OnwardJourneyLifecycle
import play.Play
import play.api.GlobalSettings
import play.api.inject.ApplicationLifecycle
import play.api.mvc.Results._
import play.api.mvc._
import play.api.mvc.{Filters => PlayFilters}
import rugby.conf.RugbyLifecycle
import services.ConfigAgentLifecycle

import scala.concurrent.ExecutionContext

class StandaloneGlobal extends GlobalSettings with BackwardCompatibleLifecycleComponents
  with OnwardJourneyLifecycle
  with ConfigAgentLifecycle
  with FaciaDfpAgentLifecycle
  with SwitchboardLifecycle
  with FootballLifecycle
  with CricketLifecycle
  with RugbyLifecycle
  with Logstash {
  override def lifecycleComponents(appLifecycle: ApplicationLifecycle)(implicit ec: ExecutionContext): List[LifecycleComponent] = List(
    new CommercialLifecycle(appLifecycle)(ec)
  )
}
