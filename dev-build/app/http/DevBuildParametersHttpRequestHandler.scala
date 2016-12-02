package http

import common.CanonicalLink
import dev.DevParametersHttpRequestHandler
import play.api.Environment
import play.api.http.{HttpConfiguration, HttpErrorHandler, HttpFilters}
import play.api.routing.Router

class DevBuildParametersHttpRequestHandler(
  router: Router,
  errorHandler: HttpErrorHandler,
  configuration: HttpConfiguration,
  filters: HttpFilters,
  environment: Environment
) extends DevParametersHttpRequestHandler(
  router = router,
  errorHandler = errorHandler,
  configuration = configuration,
  filters = filters,
  environment = environment
) {
  override val allowedParams: Seq[String] =
    CanonicalLink.significantParams ++ commercialParams ++ insignificantParams ++ Seq("query")
}
