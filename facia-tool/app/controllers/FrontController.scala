package controllers

import frontsapi.model.{Collection, Front}
import play.api.mvc.Controller
import util.Requests._
import play.api.libs.json.Json
import config.UpdateManager
import frontpress.CollectionPressing.pressAndNotify

object CreateFront {
  implicit val jsonFormat = Json.format[CreateFront]
}

case class CreateFront(
  id: String,
  navSection: Option[String],
  webTitle: Option[String],
  title: Option[String],
  description: Option[String],
  priority: Option[String],
  initialCollection: Collection
)

object FrontController extends Controller {
  def create = AjaxExpiringAuthentication { request =>
    request.body.read[CreateFront] match {
      case Some(createFrontRequest) =>
        val identity = Identity(request).get
        val newCollectionId = UpdateManager.createFront(createFrontRequest, identity)
        pressAndNotify(newCollectionId)
        Ok

      case None => BadRequest
    }
  }

  def update(frontId: String) = AjaxExpiringAuthentication { request =>
    request.body.read[Front] match {
      case Some(front) =>
        val identity = Identity(request).get
        UpdateManager.updateFront(frontId, front, identity)
        Ok

      case None => BadRequest
    }
  }
}
