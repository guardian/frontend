package controllers.front

import common._
import model._

/*
  Responsible for refreshing one block on the front (e.g. the Sport block) for one edition
 */
class TrailblockAgent(val description: TrailblockDescription) extends ExecutionContexts with Logging {

  private lazy val agent = AkkaAgent[Option[Trailblock]](None)

  def refresh() { description.query map refreshTrails }

  def refreshTrails(newTrails: Seq[Trail]) {
    agent send { _ => Some(Trailblock(description, newTrails)) }
  }

  def close() {agent.close()}

  def trailblock: Option[Trailblock] = agent()

}

object TrailblockAgent {
  def apply(description: TrailblockDescription): TrailblockAgent = new TrailblockAgent(description)
}
