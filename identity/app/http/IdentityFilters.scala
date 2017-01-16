package http

import akka.stream.Materializer
import model.ApplicationContext
import play.api.http.HttpFilters

class IdentityFilters(implicit mat: Materializer, context: ApplicationContext) extends HttpFilters {

  val filters = new HeaderLoggingFilter :: new StrictTransportSecurityHeaderFilter :: Filters.common
}
