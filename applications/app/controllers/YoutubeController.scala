package controllers

import common._
import contentapi.ContentApiClient
import model.{CacheTime, Cached}
import play.api.libs.ws.WSClient
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}

import scala.util.{Failure, Success}

class YoutubeController(
    contentApiClient: ContentApiClient,
    wsClient: WSClient,
    val controllerComponents: ControllerComponents,
) extends BaseController
    with GuLogging
    with ImplicitControllerExecutionContext {

  def getAtomId(youtubeId: String): Action[AnyContent] =
    Action.async { implicit request =>
      val capiQuery = contentApiClient.item(s"atom/media/youtube-$youtubeId")

      val response = contentApiClient.getResponse(capiQuery).map { item =>
        val atomId = item.media.map(media => JsonComponent("atomId" -> media.id))

        Cached(CacheTime.Default)(atomId.getOrElse(JsonNotFound()))
      }

      response.transform {
        case result @ Success(_) => result
        case Failure(error)      =>
          logErrorWithRequestId(s"Failed to get atom ID for youtube ID $youtubeId", error)
          Failure(error)
      }
    }
}
