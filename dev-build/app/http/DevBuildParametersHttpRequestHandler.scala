package http

import common.CanonicalLink
import dev.DevParametersHttpRequestHandler
import play.api.http.{HttpFilters, HttpConfiguration, HttpErrorHandler}
import play.api.routing.Router

class DevBuildParametersHttpRequestHandler(
  router: Router,
  errorHandler: HttpErrorHandler,
  configuration: HttpConfiguration,
  filters: HttpFilters
) extends DevParametersHttpRequestHandler(
  router = router,
  errorHandler = errorHandler,
  configuration = configuration,
  filters = filters
) {
  override val allowedParams: Seq[String] =
    CanonicalLink.significantParams ++ commercialParams ++ insignificantParams ++ Seq("query")
}
