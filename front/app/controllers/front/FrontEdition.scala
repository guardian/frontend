package controllers.front

import model.TrailblockDescription
import scala.Some
import model.Trailblock

/*
  Responsible for handling the blocks of the front for an edition
  Responsibilites include de-duping
 */
class FrontEdition(edition: String, val descriptions: Seq[TrailblockDescription]) {

  val agents = descriptions.map(TrailblockAgent(_, edition))

  def apply(): Seq[Trailblock] = {

    var usedTrails = List.empty[String]

    agents.flatMap(_.trailblock).map {
      trailblock =>
        val deDupedTrails = trailblock.trails.flatMap {
          trail =>
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

  def warmup() { agents.foreach(_.warmup()) }
}