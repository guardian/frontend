package controllers

import common._
import containers.Containers
import contentapi.ContentApiClient
import model._
import model.dotcomrendering.{OnwardItem, OnwardCollectionResponse}
import play.api.libs.json._
import play.api.mvc._
import views.support.FaciaToMicroFormat2Helpers.isCuratedContent

import scala.concurrent.Future
import scala.concurrent.duration._

class StoryPackageController(val contentApiClient: ContentApiClient, val controllerComponents: ControllerComponents)(
    implicit context: ApplicationContext,
) extends BaseController
    with Containers
    with GuLogging
    with ImplicitControllerExecutionContext {

  private[this] def getRelatedContent(path: String): Future[Seq[RelatedContentItem]] = {
    val fields =
      "headline,standfirst,shortUrl,webUrl,byline,trailText,liveBloggingNow,commentCloseDate,commentable,thumbnail,displayHint"
    val query = contentApiClient.item(path).showPackages(true).showFields(fields).showElements("image").showTags("all")
    val resp = contentApiClient.getResponse(query)
    resp.map(item => StoryPackages(path, item).items)
  }

  def render(path: String): Action[AnyContent] =
    Action.async { implicit request =>
      getRelatedContent(path).map(items => {
        val json = JsonComponent(
          OnwardCollectionResponse(
            heading = "More on this story",
            trails = items.map(_.faciaContent).map(OnwardItem.pressedContentToOnwardItem).take(10),
          ),
        )
        Cached(5.minutes)(json)
      })
    }

  def renderMF2(path: String): Action[AnyContent] =
    Action.async { implicit request =>
      getRelatedContent(path).map(items => {
        val json = JsonComponent(
          "items" -> JsArray(
            Seq(
              Json.obj(
                "displayName" -> "More on this story",
                "showContent" -> items.nonEmpty,
                "content" -> items.take(6).map(collection => isCuratedContent(collection.faciaContent)),
              ),
            ),
          ),
        )

        Cached(5.minutes)(json)
      })
    }
}
