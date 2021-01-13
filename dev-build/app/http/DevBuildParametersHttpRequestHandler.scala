package http

import common.CanonicalLink
import dev.DevParametersHttpRequestHandler
import model.ApplicationContext
import play.api.http.{HttpConfiguration, HttpErrorHandler, HttpFilters}
import play.api.routing.Router
import play.api.{BuiltInComponentsFromContext, OptionalDevContext}
import play.api.OptionalDevContext
import play.core.WebCommands

class DevBuildParametersHttpRequestHandler(
    optionalDevContext: OptionalDevContext,
    webCommands: WebCommands,
    router: Router,
    errorHandler: HttpErrorHandler,
    configuration: HttpConfiguration,
    filters: HttpFilters,
    context: ApplicationContext,
) extends DevParametersHttpRequestHandler(
      optionalDevContext,
      webCommands,
      router = router,
      errorHandler = errorHandler,
      configuration = configuration,
      filters = filters,
      context = context,
    ) {
  override val allowedParams: Seq[String] =
    CanonicalLink.significantParams ++ commercialParams ++ insignificantParams ++ Seq("query")
}
