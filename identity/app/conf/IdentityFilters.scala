package conf

import javax.inject.Inject

import akka.stream.Materializer
import filters.{HeaderLoggingFilter, StrictTransportSecurityHeaderFilter}
import model.ApplicationContext
import play.api.http.HttpFilters

class IdentityFilters(implicit mat: Materializer, context: ApplicationContext) extends HttpFilters {

  val filters = new HeaderLoggingFilter :: new StrictTransportSecurityHeaderFilter :: conf.Filters.common
}
