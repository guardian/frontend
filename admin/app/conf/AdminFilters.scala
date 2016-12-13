package conf

import akka.stream.Materializer
import com.gu.googleauth.FilterExemption
import googleAuth.GoogleAuthFilters.AuthFilterWithExemptions
import play.api.Environment
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

class AdminFilters(
  mat: Materializer,
  environment: Environment,
  cryptoConfig: CryptoConfig
) extends HttpFilters {

  val adminAuthFilter = new AuthFilterWithExemptions(
    FilterExemptions.loginExemption,
    FilterExemptions.exemptions)(mat, environment, cryptoConfig)

  val filters: List[EssentialFilter] = adminAuthFilter :: Filters.common(mat)
}
