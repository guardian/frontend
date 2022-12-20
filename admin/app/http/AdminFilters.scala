package http

import akka.stream.Materializer
import GoogleAuthFilters.AuthFilterWithExemptions
import googleAuth.FilterExemptions
import model.ApplicationContext
import play.api.http.{HttpConfiguration, HttpFilters}
import play.api.mvc.EssentialFilter

import scala.concurrent.ExecutionContext

class AdminFilters(httpConfiguration: HttpConfiguration)(implicit
    mat: Materializer,
    applicationContext: ApplicationContext,
    executionContext: ExecutionContext,
) extends HttpFilters {

  val filterExemptions = FilterExemptions(
    "/deploys", //not authenticated so it can be accessed by Prout to determine which builds have been deployed
    "/deploy", //not authenticated so it can be accessed by Riff-Raff to notify about a new build being deployed
  )
  val adminAuthFilter = new AuthFilterWithExemptions(filterExemptions.loginExemption, filterExemptions.exemptions)(
    mat,
    applicationContext,
    httpConfiguration,
  )

  val filters: List[EssentialFilter] = adminAuthFilter :: Filters.common(frontend.admin.BuildInfo)
}
