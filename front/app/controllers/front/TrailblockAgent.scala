package controllers.front

import model._
import conf.ContentApi
import com.gu.openplatform.contentapi.model.ItemResponse
import model.Trailblock
import scala.Some
import model.TrailblockDescription
import common._

import scala.concurrent.duration._
import concurrent.Future


/*
  Responsible for refreshing one block on the front (e.g. the Sport block) for one edition
 */
class TrailblockAgent(val description: TrailblockDescription) extends AkkaSupport with Logging {

  private lazy val agent = play_akka.agent[Option[Trailblock]](None)

  def refresh() = description.query map refreshTrails

  def refreshTrails(newTrails: Seq[Trail]) = {
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

  def trailblock: Option[Trailblock] = agent()

  lazy val warmup = agent().orElse(quietlyWithDefault[Option[Trailblock]](None) { agent.await(5.seconds) })
}

object TrailblockAgent {
  def apply(description: TrailblockDescription): TrailblockAgent =
    new TrailblockAgent(description)
}
