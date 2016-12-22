package http

import akka.stream.Materializer
import common.ExecutionContexts
import GoogleAuthFilters.AuthFilterWithExemptions
import model.ApplicationContext
import play.api.http.HttpFilters
import play.api.libs.crypto.CryptoConfig
import play.api.mvc.{Filter, RequestHeader, Result}

import scala.concurrent.Future

class StandaloneFilters(cryptoConfig: CryptoConfig)(implicit mat: Materializer, context: ApplicationContext) extends HttpFilters {

  val previewAuthFilter = new AuthFilterWithExemptions(
    FilterExemptions.loginExemption,
    FilterExemptions.exemptions)(mat, context, cryptoConfig)

  val filters = previewAuthFilter :: new NoCacheFilter :: Filters.common
}

// OBVIOUSLY this is only for the preview server
// NOT to be used elsewhere...
class NoCacheFilter(implicit val mat: Materializer) extends Filter with ExecutionContexts {
  override def apply(nextFilter: (RequestHeader) => Future[Result])(request: RequestHeader): Future[Result] =
    nextFilter(request).map(_.withHeaders("Cache-Control" -> "no-cache"))
}
