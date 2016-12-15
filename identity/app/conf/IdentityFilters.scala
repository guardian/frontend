package conf

import filters.{HeaderLoggingFilter, StrictTransportSecurityHeaderFilter}
import model.ApplicationContext
import play.api.http.HttpFilters

class IdentityFilters(context: ApplicationContext) extends HttpFilters {

  val filters = new HeaderLoggingFilter :: new StrictTransportSecurityHeaderFilter :: conf.Filters.common(context)
}
