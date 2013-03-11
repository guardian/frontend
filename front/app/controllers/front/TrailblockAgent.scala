package controllers.front

import model._
import conf.ContentApi
import com.gu.openplatform.contentapi.model.ItemResponse
import model.Trailblock
import scala.Some
import model.TrailblockDescription
import common._
import play.api.libs.concurrent.Execution.Implicits._
import scala.concurrent.duration._



/*
  Responsible for refreshing one block on the front (e.g. the Sport block) for one edition
 */
class TrailblockAgent(val description: TrailblockDescription, val edition: String) extends AkkaSupport with Logging {

  private lazy val agent = play_akka.agent[Option[Trailblock]](None)

  def refresh() = agent.send { old =>
    val newTrails = loadTrails(description.id)

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

  def close() = agent.close()

  def trailblock: Option[Trailblock] = agent()

  lazy val warmup = agent().orElse(quietlyWithDefault[Option[Trailblock]](None) { agent.await(5.seconds) })

  private def loadTrails(id: String): Seq[Trail] = {
    val response: ItemResponse = ContentApi.item(id, edition)
      .showEditorsPicks(true)
      .pageSize(20)
      .response

    val editorsPicks = response.editorsPicks map {
      new Content(_)
    }
    val editorsPicksIds = editorsPicks map (_.id)
    val latest = response.results map {
      new Content(_)
    } filterNot (c => editorsPicksIds contains (c.id))

    editorsPicks ++ latest
  }
}

object TrailblockAgent {
  def apply(description: TrailblockDescription, edition: String): TrailblockAgent =
    new TrailblockAgent(description, edition)
}
