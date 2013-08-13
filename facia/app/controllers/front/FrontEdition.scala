package controllers.front

import model.{ConfiguredTrailblockDescription, TrailblockDescription, Trailblock}
import common.Edition

/*
  Responsible for handling the blocks of the front for an edition
  Responsibilites include de-duping
 */
class FrontEdition(val edition: Edition, val descriptions: Seq[TrailblockDescription]) {

  val manualAgents: Seq[TrailblockAgent] = descriptions.map {
    case desc: ConfiguredTrailblockDescription => ConfiguredTrailblockAgent(desc)
    case desc => QueryTrailblockAgent(desc)
  }

  def apply(): Seq[Trailblock] = dedupe(manualAgents.flatMap(_.trailblock))

  protected def dedupe(trailblocks: Seq[Trailblock]): Seq[Trailblock] = {

    var usedTrails = List.empty[String]

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

        Trailblock(trailblock.description, deDupedTrails)
    }
  }

  def refresh() = manualAgents.foreach(_.refresh())

  def stop() = manualAgents.foreach(_.close())

}