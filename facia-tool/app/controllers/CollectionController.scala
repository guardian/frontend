package controllers

import com.gu.facia.client.models.CollectionConfigJson
import services.PressAndNotify
import util.Requests._
import play.api.mvc.Controller
import config.UpdateManager
import play.api.libs.json.Json
import auth.ExpiringActions

object CollectionRequest {
  implicit val jsonFormat = Json.format[CollectionRequest]
}

case class CollectionRequest(
  frontIds: List[String],
  collection: CollectionConfigJson
)

object CreateCollectionResponse {
  implicit val jsonFormat = Json.format[CreateCollectionResponse]
}

case class CreateCollectionResponse(id: String)

object CollectionController extends Controller {
  def create = ExpiringActions.ExpiringAuthAction { request =>
    request.body.read[CollectionRequest] match {
      case Some(CollectionRequest(frontIds, collection)) =>
        val identity = request.user
        val collectionId = UpdateManager.addCollection(frontIds, collection, identity)
        PressAndNotify(Set(collectionId))
        Ok(Json.toJson(CreateCollectionResponse(collectionId)))

      case None => BadRequest
    }
  }

  def update(collectionId: String) = ExpiringActions.ExpiringAuthAction { request =>
    request.body.read[CollectionRequest] match {
      case Some(CollectionRequest(frontIds, collection)) =>
        val identity = request.user
        UpdateManager.updateCollection(collectionId, frontIds, collection, identity)
        PressAndNotify(Set(collectionId))
        Ok

      case None => BadRequest
    }
  }
}
