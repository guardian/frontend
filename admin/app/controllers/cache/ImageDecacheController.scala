package controllers.cache

import java.net.URI
import java.util.UUID

import com.gu.googleauth.UserIdentity
import common.{ExecutionContexts, Logging}
import controllers.AuthLogging
import controllers.admin.AuthActions
import model.NoCache
import play.api.Play.current
import play.api.libs.ws.{WS, WSResponse}
import play.api.mvc.Security.AuthenticatedRequest
import play.api.mvc.{AnyContent, Controller}

import scala.concurrent.Future
import scala.concurrent.Future.successful

class ImageDecacheController extends Controller with Logging with AuthLogging with ExecutionContexts {
  import ImageDecacheController._

  private val iGuim = """i.guim.co.uk/img/(static|media|uploads)(/.*)""".r
  private val Origin = """(static|media).guim.co.uk/.*""".r

  def renderImageDecacheForm() = AuthActions.AuthActionTest { implicit request =>
    NoCache(Ok(views.html.cache.imageDecacheForm()))
  }

  def decache() = AuthActions.AuthActionTest.async { implicit request =>
    getSubmittedImage(request).map(new URI(_)).map{ image =>

      val originUrl: String = s"${image.getHost}${image.getPath}" match {
        case iGuim(host, path) => s"${image.getScheme}://$host.guim.co.uk$path"
        case Origin(_) => s"${image.getScheme}://${image.getHost}${image.getPath}"

        case _ => throw new RuntimeException(image.toString)
      }

      val cacheBust = UUID.randomUUID()

      val originUri = new URI(originUrl)

      ImageServices.clearFastly(originUri)
      ImageServices.clearImgix(originUri)

      val decacheRequest: Future[WSResponse] = WS.url(s"$originUrl?cachebust=$cacheBust").get
      decacheRequest.map(_.status).map{
        case NOT_FOUND => Ok(views.html.cache.imageDecacheForm(
          messageType = Cleared,
          image = image.toString,
          originImage = Some(originUrl)
        ))
        case OK => Ok(views.html.cache.imageDecacheForm(
          messageType = ImageStillOnOrigin,
          image = image.toString,
          originImage = Some(originUrl)
        ))
        case status => Ok(views.html.cache.imageDecacheForm(
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
