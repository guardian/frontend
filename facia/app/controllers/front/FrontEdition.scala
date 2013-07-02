package controllers.front

import model.{RunningOrderTrailblock, TrailblockDescription, Trailblock}
import scala.Some
import common.Edition

/*
  Responsible for handling the blocks of the front for an edition
  Responsibilites include de-duping
 */
class FrontEdition(val edition: Edition, val trailblocks: Seq[RunningOrderTrailblock]) {

  def apply(): Seq[RunningOrderTrailblock] = trailblocks

  def refresh() = trailblocks.foreach(_.refresh())

  def shutDown() = trailblocks.foreach(_.close())

}