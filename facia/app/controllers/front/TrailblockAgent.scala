package controllers.front

import model.{ConfiguredTrailblockDescription, Trail, Trailblock, TrailblockDescription}
import common._
import scala.Some

trait TrailblockAgent {
  def refresh()
  def close()
  def trailblock(): Option[Trailblock]
}

/*
  Responsible for refreshing one block on the front (e.g. the Sport block) for one edition
 */
class QueryTrailblockAgent(val description: TrailblockDescription) extends TrailblockAgent with AkkaSupport with Logging {

  private lazy val agent = play_akka.agent[Option[Trailblock]](None)

  def refresh() = description.query map refreshTrails

  private def refreshTrails(newTrails: Seq[Trail]) = {
    agent.send{ old =>

      val oldUrls = old.toList.flatMap(_.trails).map(_.url).toList
      val newUrls = newTrails.map(_.url).toList

      newUrls.diff(oldUrls).foreach { url =>
        log.info(s"added item: $url")
      }

      oldUrls.diff(newUrls).foreach { url =>
        log.info(s"removed item: $url")
      }

      Some(Trailblock(description, newTrails))
    }
  }

  def close() = agent.close()

  def trailblock = agent()

}

object QueryTrailblockAgent {
  def apply(description: TrailblockDescription): QueryTrailblockAgent = new QueryTrailblockAgent(description)
}

class ConfiguredTrailblockAgent(val description: ConfiguredTrailblockDescription) extends TrailblockAgent with AkkaSupport with Logging {

  private lazy val agent = play_akka.agent[Option[TrailblockAgent]](None)

  def close() = agent.close()

  def refresh() = description.configuredQuery map { query =>
    query map refreshTrailblock
  }

  private def refreshTrailblock(trailblockDescription: TrailblockDescription) = {
    agent.send { old =>
      val newAgent = QueryTrailblockAgent(trailblockDescription)
      newAgent.refresh()
      Option(newAgent)
    }
  }

  def trailblock = agent().flatMap(_.trailblock)

}

object ConfiguredTrailblockAgent {
  def apply(description: ConfiguredTrailblockDescription): ConfiguredTrailblockAgent =
    new ConfiguredTrailblockAgent(description)
}
