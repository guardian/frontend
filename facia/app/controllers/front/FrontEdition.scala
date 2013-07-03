package controllers.front

import facia.Edition
import model.{TrailblockNew}

/*
  Responsible for handling the blocks of the front for an edition
  Responsibilites include de-duping
 */
class FrontEdition(val edition: Edition, val trailblocks: Seq[TrailblockNew]) {

  def apply(): Seq[TrailblockNew] = trailblocks

  def refresh() = trailblocks.foreach(_.refresh)

  def shutDown() = trailblocks.foreach(_.close)

}