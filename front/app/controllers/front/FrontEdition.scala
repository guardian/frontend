package controllers.front

import model.TrailblockDescription
import scala.Some
import model.Trailblock

/*
  Responsible for handling the blocks of the front for an edition
  Responsibilites include de-duping
 */
class FrontEdition(val edition: String, val descriptions: Seq[TrailblockDescription]) extends ConfiguredEdition {

  val manualAgents = descriptions.map(TrailblockAgent(_, edition))

  def apply(): Seq[Trailblock] = {

    var usedTrails = List.empty[String]

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> Started cleaning up configurable fronts
    val trailblocks = manualAgents.flatMap(_.trailblock).toList match {
      case Nil => configuredTrailblocks
      case head :: Nil => head :: configuredTrailblocks
      case head :: tail => head :: configuredTrailblocks ::: tail
    }

    trailblocks.map {
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

  override def refresh() = {
    super.refresh()
    manualAgents.foreach(_.refresh())
  }

  override def shutDown() = {
    super.shutDown()
    manualAgents.foreach(_.close())
  }

  override def warmup() {
    manualAgents.foreach(_.warmup())
    super.warmup()
  }
}