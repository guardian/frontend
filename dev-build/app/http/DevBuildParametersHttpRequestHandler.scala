package http

import common.CanonicalLink
import dev.DevParametersHttpRequestHandler
import model.ApplicationContext
import play.api.http.{HttpConfiguration, HttpErrorHandler, HttpFilters}
import play.api.routing.Router

class DevBuildParametersHttpRequestHandler(
  router: Router,
  errorHandler: HttpErrorHandler,
  configuration: HttpConfiguration,
  filters: HttpFilters,
  context: ApplicationContext
) extends DevParametersHttpRequestHandler(
  router = router,
  errorHandler = errorHandler,
  configuration = configuration,
  filters = filters,
  context = context
) {
  override val allowedParams: Seq[String] =
    CanonicalLink.significantParams ++ commercialParams ++ insignificantParams ++ Seq("query")
}
