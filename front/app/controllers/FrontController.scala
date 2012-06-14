package controllers

import com.gu.openplatform.contentapi.model.ItemResponse
import common._
import conf._
import play.api.mvc.{ RequestHeader, Controller, Action }
import play.api.libs.concurrent.Akka
import akka.agent.Agent

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
      Compressed(views.html.front(FrontMetaData, model.blocks))
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

  private val ukAgents = frontItems map { _ -> Agent[Seq[Trail]](Nil)(Akka.system) } toMap
  private val usAgents = frontItems map { _ -> Agent[Seq[Trail]](Nil)(Akka.system) } toMap

  def refresh() {
    ukAgents foreach { case (item, agent) => agent.sendOff { s => loadTrails(item.id, "UK") } }
    usAgents foreach { case (item, agent) => agent.sendOff { s => loadTrails(item.id, "US") } }
  }

  def blocksFor(edition: String): Seq[FrontBlock] = {
    val blockAgents = if (edition == "US") usAgents else ukAgents
    val frontBlocks = frontItems map { item => FrontBlock(item, blockAgents(item)()) }

    frontBlocks.foldLeft(Seq.empty[FrontBlock]) {
      case (blocks, FrontBlock(item, trails)) =>
        val trailsAlreadyInList = blocks flatMap (_.trails) map (_.url)
        val newBlocks = trails.filterNot(trailsAlreadyInList contains _.url) take 10
        (blocks :+ FrontBlock(item, newBlocks)) filterNot (_.trails isEmpty)
    }
  }

  private def loadTrails(id: String, edition: String): Seq[Trail] = {

    log.info("Refreshing item " + id + " for edition " + edition)

    val response: ItemResponse = ContentApi.item
      .edition(edition)
      .showTags("all")
      .showFields("trail-text,liveBloggingNow")
      .showMedia("all")
      .showEditorsPicks(true)
      .showMostViewed(true)
      .itemId(id)
      .pageSize(15)
      .response

    val editorsPicks = response.editorsPicks map { new Content(_) }
    val editorsPicksIds = editorsPicks map (_.id)
    val latest = response.results map { new Content(_) } filterNot (c => editorsPicksIds contains (c.id))

    (editorsPicks ++ latest)
  }

}