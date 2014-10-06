package controllers

import com.gu.facia.client.models.{Front, CollectionConfig}
import play.api.mvc.Controller
import services.PressAndNotify
import util.Requests._
import play.api.libs.json.Json
import config.UpdateManager
import com.gu.googleauth.UserIdentity
import auth.ExpiringActions

object CreateFront {
  implicit val jsonFormat = Json.format[CreateFront]
}

case class CreateFront(
  id: String,
  navSection: Option[String],
  webTitle: Option[String],
  title: Option[String],
  imageUrl: Option[String],
  imageWidth: Option[Int],
  imageHeight: Option[Int],
  isImageDisplayed: Option[Boolean],
  description: Option[String],
  onPageDescription: Option[String],
  priority: Option[String],
  isHidden: Option[Boolean],
  initialCollection: CollectionConfig
)

object FrontController extends Controller {
  def create = ExpiringActions.ExpiringAuthAction { request =>
    request.body.read[CreateFront] match {
      case Some(createFrontRequest) =>
        val identity = UserIdentity.fromRequest(request).get
        val newCollectionId = UpdateManager.createFront(createFrontRequest, identity)
        PressAndNotify(Set(newCollectionId))
        Ok

      case None => BadRequest
    }
  }

  def update(frontId: String) = ExpiringActions.ExpiringAuthAction { request =>
    request.body.read[Front] match {
      case Some(front) =>
        val identity = UserIdentity.fromRequest(request).get
        UpdateManager.updateFront(frontId, front, identity)
        Ok

      case None => BadRequest
    }
  }
}
