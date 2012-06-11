package controllers

import conf._
import com.gu.openplatform.contentapi.model.ItemResponse
import common.{ Configuration => NotWantedHere, _ }
import play.api.mvc.{ RequestHeader, Controller, Action }
import play.api.libs.concurrent.Akka
import akka.actor.{ Actor, Props }

case class NetworkFrontPage(blocks: Seq[FrontBlock])

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
    val edition: String = Edition(request, Configuration)
    renderFront(NetworkFrontPage(FrontTrails.blocksFor(edition)))
  }

  private def renderFront(model: NetworkFrontPage)(implicit request: RequestHeader) =
    CachedOk(FrontMetaData) {
      views.html.front(FrontMetaData, model.blocks)
    }
}

case class FrontItem(id: String, name: String, numItemsVisible: Int)
case class FrontBlock(item: FrontItem, trails: Seq[Trail])

object FrontTrails extends Logging {

  import play.api.Play.current

  private val frontItems = Seq(
    FrontItem("/", "Top stories", 5),
    FrontItem("/sport", "Sport", 3),
    FrontItem("/football/euro2012", "Euro 2012", 3),
    FrontItem("/commentisfree", "Comment", 3),
    FrontItem("/culture", "Culture", 3),
    FrontItem("/lifeandstyle", "Life & style", 3),
    FrontItem("/business", "Business", 3)
  )

  private var ukBlocks: Seq[FrontBlock] = Nil
  private var usBlocks: Seq[FrontBlock] = Nil

  private class RefreshActor extends Actor {
    def receive = {
      case item: FrontItem =>
        ukBlocks = ukBlocks.filterNot(_.item.id == item.id) :+ FrontBlock(item, loadTrails(item.id, "UK"))
        usBlocks = usBlocks.filterNot(_.item.id == item.id) :+ FrontBlock(item, loadTrails(item.id, "US"))
    }
  }

  private val refresher = Akka.system.actorOf(Props[RefreshActor])

  def refresh() { frontItems.foreach(refresher ! _) }

  def blocksFor(edition: String) = frontItems flatMap {
    case FrontItem(id, _, _) =>
      val blocks = if (edition == "US") usBlocks else ukBlocks
      blocks.find(_.item.id == id)
  }

  private def loadTrails(id: String, edition: String): Seq[Trail] = {

    log.info("Refreshing item " + id + " for edition " + edition)

    val response: ItemResponse = ContentApi.item
      .edition(edition)
      .showTags("all")
      .showFields("all")
      .showMedia("all")
      .showEditorsPicks(true)
      .showMostViewed(true)
      .itemId(id)
      .response

    val editorsPicks = response.editorsPicks map { new Content(_) }

    if (editorsPicks isEmpty) response.results map { new Content(_) }
    else editorsPicks
  }

}