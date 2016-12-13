package conf

import javax.inject.Inject

import akka.stream.Materializer
import filters.{HeaderLoggingFilter, StrictTransportSecurityHeaderFilter}
import play.api.http.HttpFilters

class IdentityFilters @Inject() (
  implicit mat: Materializer
) extends HttpFilters {

  val filters = new HeaderLoggingFilter :: new StrictTransportSecurityHeaderFilter :: conf.Filters.common
}
