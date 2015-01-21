import model.Cors
import play.api.GlobalSettings
import play.api.mvc.{Results, Result, RequestHeader}
import scala.concurrent.Future

trait CorsErrorHandler extends GlobalSettings with Results with common.ExecutionContexts {

  private val varyFields = List("Origin", "Accept")
  private val defaultVaryFields = varyFields.mkString(",")

  override def onError(request: RequestHeader, ex: Throwable) = {
    val headers = request.headers
    val vary = headers.get("Vary").fold(defaultVaryFields)(v => (v :: varyFields).mkString(","))

    Future.successful{
      Cors(InternalServerError.withHeaders("Vary" -> vary))(request)
    }
  }

  override def onHandlerNotFound(request : RequestHeader) : Future[Result] = {
    super.onHandlerNotFound(request).map { Cors(_)(request) };
  }
  override def onBadRequest(request : RequestHeader, error : String) : Future[Result] = {
    super.onBadRequest(request, error).map { Cors(_)(request) };
  }
}
