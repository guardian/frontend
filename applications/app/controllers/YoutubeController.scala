package controllers

import com.gu.contentapi.client.model.v1.ItemResponse
import common._
import contentapi.ContentApiClient
import model.{CacheTime, Cached}
import model.Cached.RevalidatableResult
import play.api.libs.ws.WSClient
import play.api.libs.json.Json
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}

import scala.concurrent.Future

class YoutubeController(contentApiClient: ContentApiClient, wsClient: WSClient, val controllerComponents: ControllerComponents) extends BaseController with Logging with ImplicitControllerExecutionContext {

  def getAtomId(id: String): Action[AnyContent] = Action.async { implicit request =>
    val capiQuery = contentApiClient.item(s"atom/media/youtube-$id")

    val response: Future[ItemResponse] = contentApiClient.getResponse(capiQuery)

    response.map{item =>
      val atomId = item.media.map(media => Cached(CacheTime.Default)(RevalidatableResult.Ok(
        Json.obj("atomId" -> media.id)
      )))

      atomId.get
    }
  }
}
