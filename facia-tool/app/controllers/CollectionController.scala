package controllers

import frontsapi.model.Collection
import util.Requests._
import play.api.mvc.Controller
import config.UpdateManager
import play.api.libs.json.Json
import frontpress.CollectionPressing._

object CollectionRequest {
  implicit val jsonFormat = Json.format[CollectionRequest]
}

case class CollectionRequest(
  frontIds: List[String],
  collection: Collection
)

object CreateCollectionResponse {
  implicit val jsonFormat = Json.format[CreateCollectionResponse]
}

case class CreateCollectionResponse(id: String)

object CollectionController extends Controller {
  def create = AjaxExpiringAuthentication { request =>
    request.body.read[CollectionRequest] match {
      case Some(CollectionRequest(frontIds, collection)) =>
        val identity = Identity(request).get
        val collectionId = UpdateManager.addCollection(frontIds, collection, identity)
        pressAndNotify(collectionId)
        Ok(Json.toJson(CreateCollectionResponse(collectionId)))

      case None => BadRequest
    }
  }

  def update(collectionId: String) = AjaxExpiringAuthentication { request =>
    request.body.read[CollectionRequest] match {
      case Some(CollectionRequest(frontIds, collection)) =>
        val identity = Identity(request).get
        UpdateManager.updateCollection(collectionId, frontIds, collection, identity)
        pressAndNotify(collectionId)
        Ok

      case None => BadRequest
    }
  }
}
