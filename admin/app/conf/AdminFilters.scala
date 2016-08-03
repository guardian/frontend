package conf

import com.gu.googleauth.FilterExemption
import googleAuth.GoogleAuthFilters
import play.api.Environment
import play.api.http.HttpFilters
import play.api.mvc.EssentialFilter

object FilterExemptions {

  lazy val loginExemption: FilterExemption = FilterExemption("/login")
  lazy val exemptions: Seq[FilterExemption] = List(
    FilterExemption("/oauth2callback"),
    FilterExemption("/assets"),
    FilterExemption("/_healthcheck")
  )
}

class AdminFilters(
                         environment: Environment
                       ) extends HttpFilters {

  val adminAuthFilter = new GoogleAuthFilters.AuthFilterWithExemptions(
    FilterExemptions.loginExemption,
    FilterExemptions.exemptions)(environment)

  val filters: List[EssentialFilter] = adminAuthFilter :: Filters.common
}
