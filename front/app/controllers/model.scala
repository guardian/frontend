package controllers

import com.gu.openplatform.contentapi.model.ItemResponse
import common._
import conf._
import model._
import akka.util.Timeout

case class TrailblockAgent(description: TrailblockDescription, edition: String) extends AkkaSupport with Logging {

  private lazy val agent = play_akka.agent[Option[Trailblock]](None)

  def refresh() = agent.send { old =>

    log.info("refreshing trailblock " + description)

    val trails = loadTrails(description.id)

    val firstItemStoryPackage: Seq[Trail] = trails.headOption.map {
      case c: Content => loadStoryPackage(c.id)
      case _ => Nil
    } getOrElse (Nil)

    val trailsWithPackages = trails match {
      case head :: tail => TrailWithPackage(head, firstItemStoryPackage) :: tail.map(TrailWithPackage(_, Nil))
      case _ => trails.map(TrailWithPackage(_, Nil))
    }

    log.info("trailblock " + description + " refreshed with " + trailsWithPackages.size + " items")

    Some(Trailblock(description, trailsWithPackages))
  }

  def close() = agent.close()

  def trailblock: Option[Trailblock] = agent()

  private def loadTrails(id: String): Seq[Trail] = {
    log.info("Refreshing trailblock " + id + " for edition " + edition)
    val response: ItemResponse = ContentApi.item(id, edition)
      .showEditorsPicks(true)
      .pageSize(20)
      .response

    val editorsPicks = response.editorsPicks map { new Content(_) }
    val editorsPicksIds = editorsPicks map (_.id)
    val latest = response.results map { new Content(_) } filterNot (c => editorsPicksIds contains (c.id))

    editorsPicks ++ latest
  }

  private def loadStoryPackage(id: String): Seq[Trail] = {
    log.info("Refreshing story package for " + id + " for edition " + edition)
    val response: ItemResponse = ContentApi.item(id, edition)
      .showStoryPackage(true)
      .response

    response.storyPackage map { new Content(_) } filterNot (_.id == id)
  }
}

case class Front(trailblocks: Seq[Trailblock]) extends MetaData {
  override val canonicalUrl = "http://www.guardian.co.uk"
  override val id = ""
  override val section = ""
  override val apiUrl = "http://content.guardianapis.com"
  override val webTitle = "The Guardian"

  override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
    "keywords" -> "",
    "content-type" -> "Network Front"
  )

  lazy val collapseEmptyBlocks: Front = new Front(trailblocks filterNot { _.trails.isEmpty })
}

object Front {

  private lazy val ukTrailblockAgents = Seq(
    TrailblockAgent(TrailblockDescription("", "Top stories", 5), "UK"),
    TrailblockAgent(TrailblockDescription("sport", "Sport", 3), "UK"),
    TrailblockAgent(TrailblockDescription("commentisfree", "Comment is free", 3), "UK"),
    TrailblockAgent(TrailblockDescription("culture", "Culture", 3), "UK"),
    TrailblockAgent(TrailblockDescription("lifeandstyle", "Life and style", 3), "UK"),
    TrailblockAgent(TrailblockDescription("business", "Business", 3), "UK")
  )

  private lazy val usTrailblockAgents = ukTrailblockAgents map { agent => TrailblockAgent(agent.description, "US") }

  private lazy val agents = ukTrailblockAgents ++ usTrailblockAgents

  def start() = agents foreach (_.refresh())

  def shutdown() = agents foreach (_.close())

  def refresh() = agents foreach (_.refresh())

  def apply(edition: String): Front = {

    val trailBlocks = edition match {
      case "US" => usTrailblockAgents flatMap (_.trailblock)
      case _ => ukTrailblockAgents flatMap (_.trailblock)
    }

    var usedTrails = List.empty[String]

    val deDupedTrailblocks = trailBlocks.map { trailblock =>

      val deDupedTrails = trailblock.trails.flatMap { trail =>
        if (usedTrails.contains(trail.trail.url)) {
          None
        } else {
          Some(trail)
        }
      }

      //only dedupe on visible trails
      usedTrails = usedTrails ++ deDupedTrails.take(trailblock.description.numItemsVisible).map(_.trail.url)

      Trailblock(trailblock.description, deDupedTrails take (10))
    }

    Front(deDupedTrailblocks)
  }

}