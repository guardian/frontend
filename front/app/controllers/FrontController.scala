package controllers

import conf._
import com.gu.openplatform.contentapi.model.ItemResponse
import common.{ Configuration => NotWantedHere, _ }
import play.api.mvc.{ Controller, Action }

case class NetworkFrontPage(editorsPicks: Seq[Trail])

object FrontController extends Controller with Logging {

  object FrontMetaData extends MetaData {
    override val canonicalUrl = "http://www.guardian.co.uk"
    override val id = ""
    override val section = ""
    override val apiUrl = "http://content.guardianapis.com"
    override val webTitle = "The Guardian"

    override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
      "keywords" -> "",
      "content-type" -> "Network Front"
    )
  }

  def render() = Action { implicit request =>
    val edition = Configuration.edition(OriginDomain(request))
    log.debug("origin domain = " + OriginDomain(request).getOrElse("unknown"))
    lookup(edition) map { renderFront(_) } getOrElse { NotFound }
  }

  private def lookup(edition: String): Option[NetworkFrontPage] = suppressApi404 {

    log.info("Fetching network front for edition " + edition)
    val response: ItemResponse = ContentApi.item
      .edition(edition)
      .showTags("all")
      .showFields("all")
      .showMedia("all")
      .showEditorsPicks(true)
      .showMostViewed(true)
      .itemId("")
      .response

    val editorsPicks = response.editorsPicks map { new Content(_) }

    Some(NetworkFrontPage(editorsPicks))
  }

  private def renderFront(model: NetworkFrontPage) =
    CachedOk(FrontMetaData) {
      views.html.front(FrontMetaData, model.editorsPicks)
    }
}