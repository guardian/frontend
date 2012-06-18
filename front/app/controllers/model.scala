package controllers

import com.gu.openplatform.contentapi.model.ItemResponse
import common._
import conf._
import play.api.libs.concurrent.Akka
import akka.agent.Agent
import common.Content

case class FrontTrailBlock(description: FrontTrailBlockDescription, trails: Seq[Trail])
case class FrontTrailBlockDescription(id: String, name: String, numItemsVisible: Int)

class Front(val trailblocks: Seq[FrontTrailBlock]) extends MetaData {
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

object Front extends Logging {

  import play.api.Play.current

  private val frontItems = Seq(
    FrontTrailBlockDescription("/", "Top stories", 5),
    FrontTrailBlockDescription("/sport", "Sport", 3),
    FrontTrailBlockDescription("/football/euro2012", "Euro 2012", 3),
    FrontTrailBlockDescription("/commentisfree", "Comment", 3),
    FrontTrailBlockDescription("/culture", "Culture", 3),
    FrontTrailBlockDescription("/lifeandstyle", "Life & style", 3),
    FrontTrailBlockDescription("/business", "Business", 3)
  )

  private val ukAgents = frontItems map { _ -> Agent[Seq[Trail]](Nil)(Akka.system) } toMap
  private val usAgents = frontItems map { _ -> Agent[Seq[Trail]](Nil)(Akka.system) } toMap

  def refresh() {
    ukAgents foreach {
      case (item, agent) => agent.sendOff {
        s => loadTrails(item.id, "UK")
      }
    }
    usAgents foreach {
      case (item, agent) => agent.sendOff {
        s => loadTrails(item.id, "US")
      }
    }
  }

  def apply(edition: String): Front = {
    val blockAgents = if (edition == "US") usAgents else ukAgents
    val frontBlocks = frontItems map {
      item => FrontTrailBlock(item, blockAgents(item)())
    }

    val blocks = frontBlocks.foldLeft(Seq.empty[FrontTrailBlock]) {
      case (blocks, FrontTrailBlock(item, trails)) =>
        val trailsAlreadyInList = blocks flatMap (_.trails) map (_.url)
        val newBlocks = trails.filterNot(trailsAlreadyInList contains _.url) take 10
        (blocks :+ FrontTrailBlock(item, newBlocks)) filterNot (_.trails isEmpty)
    }

    new Front(blocks)
  }

  private def loadTrails(id: String, edition: String): Seq[Trail] = {
    log.info("Refreshing trailblock " + id + " for edition " + edition)

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

    val editorsPicks = response.editorsPicks map {
      new Content(_)
    }
    val editorsPicksIds = editorsPicks map (_.id)
    val latest = response.results map {
      new Content(_)
    } filterNot (c => editorsPicksIds contains (c.id))

    (editorsPicks ++ latest)
  }

}