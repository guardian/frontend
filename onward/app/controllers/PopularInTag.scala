package controllers

import com.gu.facia.client.models.CollectionConfigJson
import common._
import layout.{CollectionEssentials, FaciaContainer}
import model._
import play.api.mvc.{ RequestHeader, Controller, Action }
import services._
import slices.{Fixed, FixedContainers}

object PopularInTag extends Controller with Related with Logging with ExecutionContexts {
  def render(tag: String) = Action.async { implicit request =>
    val edition = Edition(request)
    val excludeTags = request.queryString.getOrElse("exclude-tag", Nil)
    getPopularInTag(edition, tag, excludeTags) map {
      case Nil => JsonNotFound()
      case trails => renderPopularInTag(trails)
    }
  }

  private def renderPopularInTag(trails: Seq[Content])(implicit request: RequestHeader) = Cached(600) {
    val dataId: String = "related content"
    val displayName = Some(dataId)
    val properties = FrontProperties.empty
    val config = CollectionConfigJson.withDefaults(displayName = displayName)

    val html = views.html.fragments.containers.facia_cards.container(
      FaciaContainer(
        1,
        Fixed(FixedContainers.fixedMediumFastXII),
        CollectionConfigWithId(dataId, config),
        CollectionEssentials(trails take 8, Nil, displayName, None, None, None)
      ).withTimeStamps,
      properties
    )(request)

    JsonComponent(
      "html" -> html
    )
  }
}
