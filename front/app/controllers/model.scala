package controllers

import model._

/*
  Responsible for handling the blocks of the front for an edition
  Responsibilites include de-duping
 */
class FrontEdition(agents: Seq[TrailblockAgent]) {

  def apply(): Seq[Trailblock] = {

    var usedTrails = List.empty[String]

    agents.flatMap(_.trailblock).map { trailblock =>
      val deDupedTrails = trailblock.trails.flatMap { trail =>
        if (usedTrails.contains(trail.url)) {
          None
        } else {
          Some(trail)
        }
      }

      //only dedupe on visible trails
      usedTrails = usedTrails ++ deDupedTrails.take(trailblock.description.numItemsVisible).map(_.url)

      val trailSize = trailblock.description.numItemsVisible match {
        case 1 => 1
        case other => other * 2
      }

      Trailblock(trailblock.description, deDupedTrails take (trailSize))
    }
  }

  def refresh() = agents.foreach(_.refresh())
  def shutDown() = agents.foreach(_.close())

}

class Front {

  val uk = new FrontEdition(Seq(
    TrailblockAgent("", "Top stories", 5, "UK"),
    TrailblockAgent("sport", "Sport", 5, "UK"),
    TrailblockAgent("commentisfree", "Comment is free", 3, "UK"),
    TrailblockAgent("culture", "Culture", 1, "UK"),
    TrailblockAgent("business", "Business", 1, "UK"),
    TrailblockAgent("lifeandstyle", "Life and style", 1, "UK"),
    TrailblockAgent("money", "Money", 1, "UK")
  ))

  val us = new FrontEdition(Seq(
    TrailblockAgent("", "Top stories", 5, "US"),
    TrailblockAgent("sport", "Sports", 5, "US"),
    TrailblockAgent("commentisfree", "Comment is free", 3, "US"),
    TrailblockAgent("culture", "Culture", 1, "US"),
    TrailblockAgent("business", "Business", 1, "US"),
    TrailblockAgent("lifeandstyle", "Life and style", 1, "US"),
    TrailblockAgent("money", "Money", 1, "US")
  ))

  def refresh() {
    uk.refresh()
    us.refresh()
  }

  def shutdown() {
    uk.shutDown()
    us.shutDown()
  }

  def apply(edition: String): FrontPage = edition match {
    case "US" => FrontPage(us())
    case anythingElse => FrontPage(uk())
  }
}

object Front extends Front