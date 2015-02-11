package controllers

import com.gu.facia.client.models.CollectionConfigJson
import common._
import layout.{CollectionEssentials, FaciaContainer}
import model._
import play.api.mvc.{ RequestHeader, Controller }
import services._
import performance.MemcachedAction
import slices.{Fixed, FixedContainers}
import scala.concurrent.duration._

object RelatedController extends Controller with Related with Logging with ExecutionContexts {

  private val page = new Page(
    "related-content",
    "related-content",
    "Related content",
    "GFE:Related content"
  )

  def renderHtml(path: String) = render(path)
  def render(path: String) = MemcachedAction { implicit request =>
    val edition = Edition(request)
    val excludeTags = request.queryString.getOrElse("exclude-tag", Nil)
    related(edition, path, excludeTags) map {
      case Nil => JsonNotFound()
      case trails => renderRelated(trails.sortBy(-_.webPublicationDate.getMillis))
    }
  }

  private def renderRelated(trails: Seq[Content])(implicit request: RequestHeader) = Cached(30.minutes) {
    val dataId: String = "related content"
    val displayName = Some(dataId)
    val properties = FrontProperties.empty
    val config = CollectionConfigJson.withDefaults(displayName = displayName)

    val container: FaciaContainer = FaciaContainer(1,
      Fixed(FixedContainers.fixedMediumFastXII),
      CollectionConfigWithId(dataId, config),
      CollectionEssentials(trails take 8, Nil, displayName, None, None, None)
    ).withTimeStamps

    if (request.isJson) {
      JsonComponent("html" -> views.html.fragments.containers.facia_cards.container(container, properties))
    } else {
      Ok(views.html.relatedContent(page, container.items))
    }
  }
}
