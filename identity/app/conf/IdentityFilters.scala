package conf

import filters.{HeaderLoggingFilter, StrictTransportSecurityHeaderFilter}
import play.api.http.HttpFilters

class IdentityFilters extends HttpFilters {

  val filters = new HeaderLoggingFilter :: new StrictTransportSecurityHeaderFilter :: conf.Filters.common
}
