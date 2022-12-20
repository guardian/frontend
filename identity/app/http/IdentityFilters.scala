package http

import akka.stream.Materializer
import model.ApplicationContext
import play.api.http.HttpFilters

import scala.concurrent.ExecutionContext

class IdentityFilters(implicit mat: Materializer, context: ApplicationContext, executionContext: ExecutionContext)
    extends HttpFilters {

  val filters =
    new HeaderLoggingFilter :: new StrictTransportSecurityHeaderFilter :: Filters.common(frontend.identity.BuildInfo)
}
