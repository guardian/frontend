package controllers.front

import common.{ Logging, AkkaSupport }
import io.Source
import play.api.libs.json.{ JsValue, Json }
import akka.util.duration._
import akka.util.{ Duration, Timeout }
import akka.actor.Cancellable
import java.util.concurrent.TimeUnit._
import model.Trailblock
import scala.Some
import model.TrailblockDescription

//responsible for managing the blocks of an edition that are externally configured
trait ConfiguredEdition extends AkkaSupport with Logging {

  def edition: String

  //TODO
  val configUrl = "http://s3-eu-west-1.amazonaws.com/aws-frontend-store/TMC/config/front-test.json" //Configuration.configUrl

  val configAgent = play_akka.agent[Seq[TrailblockAgent]](Nil)

  def refresh() = configAgent.sendOff { oldAgents =>

    val configString = Source.fromURL(configUrl).mkString
    val jsonConfig = Json.parse(configString)

    val newTrailblocks = toBlocks(jsonConfig \ (edition.toLowerCase))

    //only replace blocks if they are different
    val newAgents = newTrailblocks.map { newDescription =>
      oldAgents.find(oldBlock => oldBlock.description == newDescription)
        .getOrElse(TrailblockAgent(newDescription, edition))
    }

    //kill unneeded agents
    oldAgents.filterNot(old => newAgents.exists(_.description == old.description)).foreach(_.close())

    newAgents.foreach(_.refresh())

    newAgents
  }

  def shutDown() = configAgent().foreach(_.close())

  def warmup() = try {
    configAgent.await(Timeout(5 seconds)).foreach(_.warmup())
  } catch {
    case e =>
      log.error("Exception while waiting to load config", e)
      None
  }

  def configuredTrailblocks: List[Trailblock] = configAgent().flatMap(_.trailblock).toList

  private def toBlocks(editionJson: JsValue): Seq[TrailblockDescription] = {
    (editionJson \ "blocks").as[Seq[JsValue]] map { block =>
      TrailblockDescription(
        toId((block \ "id").as[String]),
        (block \ "title").as[String],
        (block \ "numItems").as[String].toInt
      )
    }
  }

  private def toId(id: String) = id.split("/").toSeq match {
    case Seq(start, end) if start == end => start // this is a sections tag e.g. politics/politics
    case _ => id
  }
}