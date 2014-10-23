package controllers

import com.gu.facia.client.models.CollectionConfig
import common._
import layout.ContainerLayout
import model._
import play.api.mvc.{ RequestHeader, Controller, Action }
import services._
import slices.FixedContainers

object PopularInTag extends Controller with Related with Logging with ExecutionContexts {

  def render(tag: String) = Action.async { implicit request =>
    val edition = Edition(request)
    getPopularInTag(edition, tag) map {
      case Nil => JsonNotFound()
      case trails => renderPopularInTag(trails)
    }
  }

  private def renderPopularInTag(trails: Seq[Content])(implicit request: RequestHeader) = Cached(600) {
    val dataId: String = "related content"
    val displayName = Some(dataId)
    val properties = FrontProperties.empty
    val collection = Collection(trails.take(8), displayName)
    val layout = ContainerLayout(FixedContainers.fixedMediumFastXII, collection, None)
    val config = CollectionConfig.withDefaults(displayName = displayName)

    val html = views.html.fragments.containers.facia_cards.container(collection, layout, 1, properties, dataId)(request, new views.support.TemplateDeduping, config)

    JsonComponent(
      "html" -> html
    )
  }
}