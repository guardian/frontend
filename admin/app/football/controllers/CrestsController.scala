package controllers.admin

import model.Cached.RevalidatableResult
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents, MultipartFormData, Request}
import play.api.libs.ws.WSClient
import play.api.libs.json.Json
import common.{GuLogging, ImplicitControllerExecutionContext}
import model.{ApplicationContext, Cached}
import play.api.libs.Files.TemporaryFile
import services.S3SportsAssets

import scala.concurrent.Future

class CrestsController(
    val wsClient: WSClient,
    val controllerComponents: ControllerComponents,
)(implicit val context: ApplicationContext)
    extends BaseController
    with ImplicitControllerExecutionContext
    with GuLogging {

  def index: Action[AnyContent] =
    Action { implicit request =>
      Cached(60)(RevalidatableResult.Ok(views.html.football.crests()))
    }

  def upload: Action[MultipartFormData[TemporaryFile]] =
    Action.async(parse.multipartFormData) { implicit request =>
      request.body.file("crest") match {
        case Some(crest) =>
          val image = crest.ref.path.toFile
          val filename = crest.filename

          S3SportsAssets
            .putObjectAsync(s"test/$filename", image, "image/png")
            .map { _ =>
              Ok("Success!")
            }
            .recover { case exception: Exception =>
              InternalServerError(s"Upload failed: ${exception.getMessage}")
            }
        case None => Future.successful(BadRequest("No 'crest' file to upload."))
      }
    }
}
