package controllers.front

import model.TrailblockDescription
import scala.Some
import model.Trailblock

/*
  Responsible for handling the blocks of the front for an edition
  Responsibilites include de-duping
 */
class FrontEdition(val edition: String, val descriptions: Seq[TrailblockDescription]) {

  val manualAgents = descriptions.map(TrailblockAgent(_, edition))

  def apply(): Seq[Trailblock] = {

    var usedTrails = List.empty[String]

    manualAgents.flatMap(_.trailblock).map {
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

  def refresh() = manualAgents.foreach(_.refresh())

  def shutDown() = manualAgents.foreach(_.close())

  def warmup() = manualAgents.foreach(_.warmup())

}