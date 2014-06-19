package controllers

import frontsapi.model.Collection
import util.Requests._
import play.api.mvc.Controller
import config.UpdateManager
import play.api.libs.json.Json
import frontpress.CollectionPressing._

object CreateCollectionResponse {
  implicit val jsonFormat = Json.format[CreateCollectionResponse]
}

case class CreateCollectionResponse(id: String)

object CollectionController extends Controller {
  def create = AjaxExpiringAuthentication { request =>
    request.body.read[Collection] match {
      case Some(collection) =>
        val identity = Identity(request).get
        val collectionId = UpdateManager.addCollection(collection, identity)
        pressAndNotify(collectionId)
        Ok(Json.toJson(CreateCollectionResponse(collectionId)))

      case None => BadRequest
    }
  }

  def update(collectionId: String) = AjaxExpiringAuthentication { request =>
    request.body.read[Collection] match {
      case Some(collection) =>
        val identity = Identity(request).get
        UpdateManager.updateCollection(collectionId, collection, identity)
        pressAndNotify(collectionId)
        Ok

      case None => BadRequest
    }
  }
}
