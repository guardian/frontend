package controllers.front

import common._
import play.api.libs.json.{JsObject, JsValue, JsNull}
import play.api.libs.json.Json.parse
import play.api.libs.concurrent.Execution.Implicits._
import scala.concurrent.duration._
import conf.Configuration
import model.Trailblock
import model.TrailblockDescription
import play.api.libs.ws.WS

//responsible for managing the blocks of an edition that are externally configured
class ConfiguredEdition(edition: String, descriptions: Seq[TrailblockDescription])
    extends FrontEdition(edition, descriptions)
    with AkkaSupport with Logging {


  val configUrl = Configuration.front.config

  val configAgent = play_akka.agent[Seq[TrailblockAgent]](Nil)

  override def apply(): Seq[Trailblock] = {
    val trailblocks = manualAgents.flatMap(_.trailblock).toList match {
      case Nil => configuredTrailblocks
      case head :: Nil => head :: configuredTrailblocks
      case head :: tail => head :: configuredTrailblocks ::: tail
    }
    dedupe(trailblocks)
  }

  override def refresh() = {
    super.refresh()
    log.info(s"loading front configuration from: $configUrl")
    WS.url(configUrl).withTimeout(2000).get().foreach{ response =>
      response.status match {
        case 200 => configAgent.send(oldAgents => refreshAgents(response.body, oldAgents))
        case _ => log.error(s"error fetching config ${response.status} ${response.statusText}")
      }
    }
  }

  private def refreshAgents(configString: String, oldAgents: Seq[TrailblockAgent]) = {
    val newTrailblocks = toBlocks(parse(configString) \ (edition.toLowerCase))

    //only replace blocks if they are different (do not replace an old block with the same new block)
    val newAgents: Seq[TrailblockAgent] = newTrailblocks.map { newDescription =>
      oldAgents.find(oldBlock => oldBlock.description == newDescription)
        .getOrElse(TrailblockAgent(newDescription, edition))
    }

    //close down the old agents we no longer need so they can be garbage collected
    oldAgents.filterNot(old => newAgents.exists(_.description == old.description)).foreach(_.close())

    newAgents.foreach(_.refresh())
    newAgents.foreach(a => log.info(s"Front configuration loaded: ${a.description}"))
    newAgents
  }

  override def shutDown() = {
    super.shutDown()
    configAgent().foreach(_.close())
  }

  override def warmup() = {
    super.warmup()
    quietly(configAgent.await(5.seconds).foreach(_.warmup))
  }

  def configuredTrailblocks: List[Trailblock] = configAgent().flatMap(_.trailblock).toList

  private def toBlocks(editionJson: JsValue): Seq[TrailblockDescription] = editionJson match {
    case JsNull => Nil
    case _ =>  (editionJson \ "blocks").as[Seq[JsValue]] map { block =>
        TrailblockDescription(
          toId((block \ "id").as[String]),
          (block \ "title").as[String],
          (block \ "numItems").as[Int],
          showMore = (block \ "showMore").asOpt[Boolean].getOrElse(false)
        )
      }

  }

  private def toId(id: String) = id.split("/").toSeq match {
    case Seq(start, end) if start == end => start // this is a sections tag e.g. politics/politics
    case _ => id
  }
}