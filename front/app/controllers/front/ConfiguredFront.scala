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

class ConfiguredFront extends AkkaSupport with Logging {

  val refreshDuration = Duration(60, SECONDS)

  //TODO
  val configUrl = "http://s3-eu-west-1.amazonaws.com/aws-frontend-store/TMC/config/front-test.json" //Configuration.configUrl

  val configAgent = play_akka.agent[Seq[TrailblockAgent]](Nil)

  private var refreshSchedule: Option[Cancellable] = None

  def refresh() = configAgent.sendOff { oldAgents =>

    val oldUkAgents = oldAgents.filter(_.edition == "UK")
    val oldUsAgents = oldAgents.filter(_.edition == "US")

    val configString = Source.fromURL(configUrl).mkString
    val jsonConfig = Json.parse(configString)

    val usBlocks = toBlocks(jsonConfig \ "us")
    val ukBlocks = toBlocks(jsonConfig \ "uk")

    val newUkAgents = ukBlocks.map { newDescription =>
      oldUkAgents.find(oldBlock => oldBlock.description == newDescription).getOrElse(TrailblockAgent(newDescription, "UK"))
    }

    val newUsAgents = usBlocks.map { newDescription =>
      oldUsAgents.find(oldBlock => oldBlock.description == newDescription).getOrElse(TrailblockAgent(newDescription, "US"))
    }

    val newAgents = newUkAgents ++ newUsAgents

    //kill unneeded agents

    oldAgents.filterNot(old => newAgents.exists(_.description == old.description)).foreach(_.close())

    newAgents.foreach(_.refresh())

    newAgents
  }

  def startup() {
    refreshSchedule = Some(play_akka.scheduler.every(refreshDuration, initialDelay = Duration(5, SECONDS)) {
      log.info("Refreshing ConfiguredFront")
      refresh()
    })
  }

  def shutDown() = {
    refreshSchedule.foreach(_.cancel())
    configAgent().foreach(_.close())
  }

  def await() = configAgent.await(Timeout(5 seconds))

  def apply(edition: String): Seq[Trailblock] = configAgent().filter(_.edition == edition).flatMap(_.trailblock)

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

object ConfiguredFront extends ConfiguredFront
