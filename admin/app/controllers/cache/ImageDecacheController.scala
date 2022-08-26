package controllers.cache

import java.net.URI
import java.util.UUID
import com.gu.googleauth.UserIdentity
import common.{GuLogging, ImplicitControllerExecutionContext}
import controllers.admin.AdminAuthController
import model.{ApplicationContext, NoCache}
import play.api.http.HttpConfiguration
import play.api.libs.ws.{WSClient, WSResponse}
import play.api.mvc.Security.AuthenticatedRequest
import play.api.mvc._

import scala.concurrent.Future
import scala.concurrent.Future.successful

class ImageDecacheController(
    wsClient: WSClient,
    val controllerComponents: ControllerComponents,
    val httpConfiguration: HttpConfiguration,
)(implicit context: ApplicationContext)
    extends BaseController
    with GuLogging
    with ImplicitControllerExecutionContext
    with AdminAuthController {
  import ImageDecacheController._

  private val iGuim = """i.(guim|guimcode).co.uk/img/(static|media|uploads|sport)(/.*)""".r
  private val Origin = """(static|media|sport|uploads).guim.co.uk/.*""".r

  def renderImageDecacheForm(): Action[AnyContent] =
    Action { implicit request =>
      NoCache(Ok(views.html.cache.imageDecache()))
    }

  def decache(): Action[AnyContent] =
    AdminAuthAction(httpConfiguration).async { implicit request =>
      getSubmittedImage(request)
        .map(new URI(_))
        .map { imageUri =>
          // here we limit the url to ones for which purging is supported
          val originUrl: String = s"${imageUri.getHost}${imageUri.getPath}" match {
            case iGuim(_, host, path) => s"${imageUri.getScheme}://$host.guim.co.uk$path"
            case Origin(_)            => s"${imageUri.getScheme}://${imageUri.getHost}${imageUri.getPath}"

            case _ => throw new RuntimeException(imageUri.toString)
          }

          val cacheBust = UUID.randomUUID()
          val originUri = new URI(originUrl)

          ImageServices.clearFastly(originUri, wsClient)

          val decacheRequest: Future[WSResponse] = wsClient.url(s"$originUrl?cachebust=$cacheBust").get()
          decacheRequest
            .map(_.status)
            .map {
              case NOT_FOUND =>
                Ok(
                  views.html.cache.imageDecache(
                    messageType = Cleared,
                    image = imageUri.toString,
                    originImage = Some(originUrl),
                  ),
                )
              case OK =>
                Ok(
                  views.html.cache.imageDecache(
                    messageType = ImageStillOnOrigin,
                    image = imageUri.toString,
                    originImage = Some(originUrl),
                  ),
                )
              case status =>
                Ok(
                  views.html.cache.imageDecache(
                    messageType = Error,
                    image = imageUri.toString,
                    originImage = Some(originUrl),
                  ),
                )
            }
            .map(NoCache(_))

        }
        .getOrElse(successful(BadRequest("No image submitted")))

    }

  private def getSubmittedImage(request: AuthenticatedRequest[AnyContent, UserIdentity]): Option[String] =
    request.body.asFormUrlEncoded
      .getOrElse(Map.empty)
      .get("url")
      .flatMap(_.headOption)
      .map(_.trim)

}

object ImageDecacheController {
  sealed trait MessageType
  case object ImageStillOnOrigin extends MessageType
  case object DefaultMessage extends MessageType
  case object Cleared extends MessageType
  case object Error extends MessageType
}
