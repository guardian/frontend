package controllers

import com.gu.facia.client.models.CollectionConfig
import common._
import layout.ContainerLayout
import model._
import play.api.mvc.{ RequestHeader, Controller }
import services._
import performance.MemcachedAction
import slices.FixedContainers
import scala.concurrent.duration._

object RelatedController extends Controller with Related with Logging with ExecutionContexts {

  def renderHtml(path: String) = render(path)
  def render(path: String) = MemcachedAction { implicit request =>
    val edition = Edition(request)
    related(edition, path) map {
      case Nil => JsonNotFound()
      case trails => renderRelated(trails.sortBy(-_.webPublicationDate.getMillis))
    }
  }

  private def renderRelated(trails: Seq[Content])(implicit request: RequestHeader) = Cached(30.minutes) {
    val dataId: String = "related content"
    val displayName = Some(dataId)
    val properties = FrontProperties.empty
    val collection = Collection(trails.take(8), displayName)
    val layout = ContainerLayout(FixedContainers.all("fixed/medium/fast-XII"), collection, None)
    val config = CollectionConfig.withDefaults(displayName = displayName)

    val html = views.html.fragments.containers.facia_cards.container(collection, layout, 1, properties, dataId)(request, new views.support.TemplateDeduping, config)

    if (request.isJson) {
      JsonComponent("html" -> html)
    } else {
      Ok(html)
    }
  }
}
