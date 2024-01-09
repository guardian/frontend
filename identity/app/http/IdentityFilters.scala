package http

import akka.stream.Materializer
import model.ApplicationContext
import play.api.http.HttpFilters

import scala.concurrent.ExecutionContext
import play.api.mvc.EssentialFilter

class IdentityFilters(implicit mat: Materializer, context: ApplicationContext, executionContext: ExecutionContext)
    extends HttpFilters {

  val filters: List[EssentialFilter] =
    new HeaderLoggingFilter :: new StrictTransportSecurityHeaderFilter :: Filters.common(frontend.identity.BuildInfo)
}
