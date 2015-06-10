package controllers

import com.gu.facia.client.models.{FrontJson, CollectionConfigJson}
import play.api.mvc.Controller
import services.Press
import util.Requests._
import play.api.libs.json.Json
import config.UpdateManager
import com.gu.pandomainauth.model.User
import auth.PanDomainAuthActions

object CreateFront {
  implicit val jsonFormat = Json.format[CreateFront].filter(_.id.matches("""^[a-z0-9\/\-+]*$"""))
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
  initialCollection: CollectionConfigJson
)

object FrontController extends Controller with PanDomainAuthActions {
  def create = AuthAction { request =>
    request.body.read[CreateFront] match {
      case Some(createFrontRequest) =>
        val identity = request.user
        val newCollectionId = UpdateManager.createFront(createFrontRequest, identity)
        Press.fromSetOfIdsWithForceConfig(Set(newCollectionId))
        Ok

      case None => BadRequest
    }
  }

  def update(frontId: String) = AuthAction { request =>
    request.body.read[FrontJson] match {
      case Some(front) =>
        val identity = request.user
        UpdateManager.updateFront(frontId, front, identity)
        Press.fromSetOfIdsWithForceConfig(front.collections.toSet)
        Ok

      case None => BadRequest
    }
  }
}
