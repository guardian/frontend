import com.gu.googleauth.{FilterExemption, UserIdentity}
import commercial.CommercialLifecycle
import common.ExecutionContexts
import common.Logback.Logstash
import common.dfp.FaciaDfpAgentLifecycle
import conf._
import controllers.AuthCookie
import feed.OnwardJourneyLifecycle
import play.Play
import play.api.mvc.Results._
import play.api.mvc._
import play.api.mvc.{Filters => PlayFilters}
import rugby.conf.RugbyLifecycle
import services.ConfigAgentLifecycle

import scala.concurrent.Future

class StandaloneGlobal extends CommercialLifecycle
  with OnwardJourneyLifecycle
  with ConfigAgentLifecycle
  with FaciaDfpAgentLifecycle
  with SwitchboardLifecycle
  with FootballLifecycle
  with CricketLifecycle
  with RugbyLifecycle
  with Logstash
