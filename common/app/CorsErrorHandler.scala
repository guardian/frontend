import conf.Configuration
import play.api.GlobalSettings
import play.api.mvc.{Results, RequestHeader}
import scala.concurrent.Future

trait CorsErrorHandler extends GlobalSettings with Results {

  private val varyFields = List("Origin", "Accept")
  private val defaultVaryFields = varyFields.mkString(",")

  override def onError(request: RequestHeader, ex: Throwable) = {
    val headers = request.headers
    val vary = headers.get("Vary").fold(defaultVaryFields)(v => (v :: varyFields).mkString(","))

    request.headers.get("Origin") match {
        case None => Future.successful(InternalServerError.withHeaders("Vary" -> vary))
        case Some(requestOrigin) => Future.successful(
          InternalServerError.withHeaders(
             "Vary" -> vary,
             "Access-Control-Allow-Origin" -> Configuration.ajax.corsOrigins.find( _ == requestOrigin ).getOrElse("*"),
             "Access-Control-Allow-Credentials" -> "true",
             "Access-Control-Allow-Headers" -> "X-Requested-With",
             "Access-Control-Allow-Methods" -> "GET,POST"
          )
        )
    }
  }
}
