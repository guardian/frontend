package http

import akka.stream.Materializer
import GoogleAuthFilters.AuthFilterWithExemptions
import com.gu.googleauth.FilterExemption
import model.ApplicationContext
import play.api.http.HttpFilters
import play.api.libs.crypto.CryptoConfig
import play.api.mvc.EssentialFilter

object FilterExemptions {

  lazy val loginExemption: FilterExemption = FilterExemption("/login")
  lazy val exemptions: Seq[FilterExemption] = List(
    FilterExemption("/oauth2callback"),
    FilterExemption("/assets"),
    FilterExemption("/_healthcheck"),
    FilterExemption("/deploys-notify") // This endpoint is authenticated via api-key (to be accessible to riffraff hook for instance)
  )
}

class AdminFilters(cryptoConfig: CryptoConfig)(implicit mat: Materializer, context: ApplicationContext) extends HttpFilters {

  val adminAuthFilter = new AuthFilterWithExemptions(
    FilterExemptions.loginExemption,
    FilterExemptions.exemptions)(mat, context, cryptoConfig)

  val filters: List[EssentialFilter] = adminAuthFilter :: Filters.common
}
