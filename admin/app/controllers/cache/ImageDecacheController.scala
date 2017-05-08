package controllers.cache

import java.net.URI
import java.util.UUID

import com.gu.googleauth.UserIdentity
import common.{ExecutionContexts, Logging}
import controllers.admin.AuthActions
import model.{ApplicationContext, NoCache}
import play.api.libs.ws.{WSClient, WSResponse}
import play.api.mvc.Security.AuthenticatedRequest
import play.api.mvc.{Action, AnyContent, Controller}

import scala.concurrent.Future
import scala.concurrent.Future.successful

class ImageDecacheController(wsClient: WSClient)(implicit context: ApplicationContext) extends Controller with Logging with ExecutionContexts {
    import ImageDecacheController._

  val imageServices = new ImageServices(wsClient)
  val authActions = new AuthActions(wsClient)

  private val iGuim = """i.guim.co.uk/img/(static|media|uploads)(/.*)""".r
  private val Origin = """(static|media).guim.co.uk/.*""".r

  def renderImageDecacheForm() = Action { implicit request =>
    NoCache(Ok(views.html.cache.imageDecache()))
  }

  def decache(): Action[AnyContent] = authActions.AuthActionTest.async { implicit request =>
    getSubmittedImage(request).map(new URI(_)).map{ image =>

      val originUrl: String = s"${image.getHost}${image.getPath}" match {
        case iGuim(host, path) => s"${image.getScheme}://$host.guim.co.uk$path"
        case Origin(_) => s"${image.getScheme}://${image.getHost}${image.getPath}"

        case _ => throw new RuntimeException(image.toString)
      }

      val cacheBust = UUID.randomUUID()

      val originUri = new URI(originUrl)

      imageServices.clearFastly(originUri)
      imageServices.clearImgix(originUri)

      val decacheRequest: Future[WSResponse] = wsClient.url(s"$originUrl?cachebust=$cacheBust").get
      decacheRequest.map(_.status).map{
        case NOT_FOUND => Ok(views.html.cache.imageDecache(
          messageType = Cleared,
          image = image.toString,
          originImage = Some(originUrl)
        ))
        case OK => Ok(views.html.cache.imageDecache(
          messageType = ImageStillOnOrigin,
          image = image.toString,
          originImage = Some(originUrl)
        ))
        case _ => Ok(views.html.cache.imageDecache(
          messageType = Error,
          image = image.toString,
          originImage = Some(originUrl)
        ))
      }.map(NoCache(_))

    }.getOrElse(successful(BadRequest("No image submitted")))

  }

  private def getSubmittedImage(request: AuthenticatedRequest[AnyContent, UserIdentity]): Option[String] = request
    .body.asFormUrlEncoded
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
