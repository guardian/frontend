package controllers

import common._
import containers.Containers
import contentapi.ContentApiClient
import model._
import play.api.libs.json._
import play.api.mvc._
import views.support.FaciaToMicroFormat2Helpers.isCuratedContent

import scala.concurrent.duration._

class StoryPackageController(val contentApiClient: ContentApiClient, val controllerComponents: ControllerComponents)(implicit context: ApplicationContext)
  extends BaseController
    with Containers
    with Logging
    with ImplicitControllerExecutionContext {

  def render(path: String): Action[AnyContent] = Action.async { implicit request =>
    val query = contentApiClient.item(path).showPackages(true)
    val resp = contentApiClient.getResponse(query)

    for {
      items <- resp.map(item => StoryPackages(path, item).items)
    } yield {
      Cached(5.minutes) {
        JsonComponent(
          "items" -> JsArray(Seq(
            Json.obj(
              "displayName" -> "More on this story",
              "showContent" -> items.nonEmpty,
              "content" -> items.map( collection => isCuratedContent(collection.faciaContent))
            )
          ))
        )
      }
    }
  }
}
