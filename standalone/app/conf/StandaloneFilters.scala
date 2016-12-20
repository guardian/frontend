package conf

import akka.stream.Materializer
import com.gu.googleauth.FilterExemption
import common.ExecutionContexts
import googleAuth.GoogleAuthFilters.AuthFilterWithExemptions
import model.ApplicationContext
import play.api.http.HttpFilters
import play.api.libs.crypto.CryptoConfig
import play.api.mvc.{Filter, RequestHeader, Result}

import scala.concurrent.Future

// OBVIOUSLY this is only for the preview server
// NOT to be used elsewhere...
class NoCacheFilter(implicit val mat: Materializer) extends Filter with ExecutionContexts {
  override def apply(nextFilter: (RequestHeader) => Future[Result])(request: RequestHeader): Future[Result] =
    nextFilter(request).map(_.withHeaders("Cache-Control" -> "no-cache"))
}

object FilterExemptions {

  lazy val loginExemption: FilterExemption = FilterExemption("/login")
  lazy val exemptions: Seq[FilterExemption] = List(
    FilterExemption("/oauth2callback"),
    FilterExemption("/assets"),
    FilterExemption("/favicon.ico"),
    FilterExemption("/_healthcheck"),
    FilterExemption("/2015-06-24-manifest.json"),
    // the healthcheck url
    FilterExemption("/world/2012/sep/11/barcelona-march-catalan-independence")
  )
}

class StandaloneFilters(cryptoConfig: CryptoConfig)(implicit mat: Materializer, context: ApplicationContext) extends HttpFilters {

  val previewAuthFilter = new AuthFilterWithExemptions(
    FilterExemptions.loginExemption,
    FilterExemptions.exemptions)(mat, context, cryptoConfig)

  val filters = previewAuthFilter :: new NoCacheFilter :: Filters.common
}
