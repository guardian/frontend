package controllers

import model._

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

  private lazy val ukTrailblockAgents: Seq[TrailblockAgent] = Seq(
    TrailblockAgent(TrailblockDescription("", "Top stories", 5), "UK"),
    TrailblockAgent(TrailblockDescription("sport", "Sport", 3), "UK"),
    TrailblockAgent(TrailblockDescription("commentisfree", "Comment is free", 3), "UK"),
    TrailblockAgent(TrailblockDescription("culture", "Culture", 3), "UK"),
    TrailblockAgent(TrailblockDescription("lifeandstyle", "Life and style", 3), "UK"),
    TrailblockAgent(TrailblockDescription("business", "Business", 3), "UK")
  )

  private lazy val usTrailblockAgents: Seq[TrailblockAgent] = ukTrailblockAgents map { agent => TrailblockAgent(agent.description, "US") }

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