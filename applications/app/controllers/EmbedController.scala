package controllers

import com.gu.contentapi.client.model.ItemResponse
import conf._
import common._
import model._
import play.api.mvc._
import scala.concurrent.Future
import LiveContentApi.getResponse

case class EmbedPage(model: Option[Video], title: String, isExpired: Boolean = false)

object EmbedController extends Controller with Logging with ExecutionContexts {

  def render(path: String) = Action.async { implicit request =>
    lookup(path) map {
      case Left(model) => renderVideo(EmbedPage(Some(model), model.headline))
      case Right(other) => renderOther(other)
    }
  }

  private def lookup(path: String)(implicit request: RequestHeader) = {
    val edition = Edition(request)

    log.info(s"Fetching video: $path for edition $edition")

    val response: Future[ItemResponse] = getResponse(LiveContentApi.item(path, edition)
      .showFields("all")
    )

    val result = response map { response =>
      val modelOption: Option[Video] = response.content.filter(_.isVideo).map(Video(_))

      modelOption match {
        case Some(x) => Left(x)
        case _ => Right(NotFound)
      }
    }

    result recover convertApiExceptions
  }

  private def renderOther(result: Result)(implicit request: RequestHeader) = result.header.status match {
    case 404 => NoCache(NotFound)
    case 410 => Cached(60)(Gone(views.html.videoEmbed(EmbedPage(None, "Content expired", true))))
    case _ => result
  }

  private def renderVideo(model: EmbedPage)(implicit request: RequestHeader): Result = {
    Cached(600)(Ok(views.html.videoEmbed(model)))
  }
}
