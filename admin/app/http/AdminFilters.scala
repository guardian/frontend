package http

import akka.stream.Materializer
import conf.FilterExemptions
import GoogleAuthFilters.AuthFilterWithExemptions
import model.ApplicationContext
import play.api.http.HttpFilters
import play.api.libs.crypto.CryptoConfig
import play.api.mvc.EssentialFilter

class AdminFilters(cryptoConfig: CryptoConfig)(implicit mat: Materializer, context: ApplicationContext) extends HttpFilters {

  val adminAuthFilter = new AuthFilterWithExemptions(
    FilterExemptions.loginExemption,
    FilterExemptions.exemptions)(mat, context, cryptoConfig)

  val filters: List[EssentialFilter] = adminAuthFilter :: Filters.common
}
