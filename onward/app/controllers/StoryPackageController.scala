package controllers

import common._
import containers.Containers
import contentapi.ContentApiClient
import model._
import model.dotcomrendering.{Trail, OnwardCollectionResponse}
import play.api.mvc._

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
        val json = JsonComponent.fromWritable(
          OnwardCollectionResponse(
            heading = "More on this story",
            trails = items.map(_.faciaContent).map(Trail.pressedContentToTrail).take(10),
          ),
        )
        Cached(5.minutes)(json)
      })
    }
}
