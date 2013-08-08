package controllers.front

import model._
import model.Trailblock
import scala.Some
import model.TrailblockDescription
import common._
import scala.concurrent.Await
import scala.concurrent.duration._
import akka.util.Timeout

/*
  Responsible for refreshing one block on the front (e.g. the Sport block) for one edition
 */
class TrailblockAgent(val description: TrailblockDescription) extends AkkaSupport with Logging {

  private lazy val agent = play_akka.agent[Option[Trailblock]](None)

  def refresh() {

    // Use send rather than alter, which provides a Future that has an AskTimeoutException deadline.
    agent.send{ old =>

      val oldUrls = old.toList.flatMap(_.trails).map(_.url).toList

      var newTrails: Seq[Trail] = Nil
      try {
        newTrails = Await.result(description.query, 10.seconds)
      }
      catch {
        case e:Exception => log.info(s"trailblock agent did not receive new trails: ${e.getMessage}")
      }

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

  def close() {agent.close()}

  def trailblock: Option[Trailblock] = agent()
  def await(implicit timeout: Timeout): Option[Trailblock] = agent.await
}

object TrailblockAgent {
  def apply(description: TrailblockDescription): TrailblockAgent =
    new TrailblockAgent(description)
}
