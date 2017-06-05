package http

import akka.stream.Materializer
import GoogleAuthFilters.AuthFilterWithExemptions
import googleAuth.FilterExemptions
import model.ApplicationContext
import play.api.http.HttpFilters
import play.api.libs.crypto.CryptoConfig
import play.api.mvc.EssentialFilter

class AdminFilters(cryptoConfig: CryptoConfig)(implicit mat: Materializer, context: ApplicationContext) extends HttpFilters {

  val filterExemptions = FilterExemptions(
    "/deploys", //not authenticated so it can be accessed by Prout to determine which builds have been deployed
    "/deploy"   //not authenticated so it can be accessed by Riff-Raff to notify about a new build being deployed
  )
  val adminAuthFilter = new AuthFilterWithExemptions(
    filterExemptions.loginExemption,
    filterExemptions.exemptions)(mat, context, cryptoConfig)

  val filters: List[EssentialFilter] = adminAuthFilter :: Filters.common
}
