package controllers.front

import common._
import play.api.libs.json.JsValue
import play.api.libs.json.Json.parse
import akka.util.duration._
import akka.util.Timeout
import conf.Configuration
import common.Response
import model.Trailblock
import model.TrailblockDescription

//responsible for managing the blocks of an edition that are externally configured
class ConfiguredEdition(edition: String, descriptions: Seq[TrailblockDescription])
    extends FrontEdition(edition, descriptions)
    with AkkaSupport with HttpSupport with Logging {

  override lazy val proxy = Proxy(Configuration)

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
    configAgent.sendOff { oldAgents =>
      log.info("loading front configuration from: " + configUrl)
      http.GET(configUrl) match {
        case Response(200, json, _) => refreshAgents(json, oldAgents)
        case Response(errorCode, _, errorMessage) =>
          log.error("error fetching config %s %s" format (errorCode, errorMessage))
          oldAgents
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
    newAgents.foreach(a => log.info("Front configuration loaded: " + a.description))
    newAgents
  }

  override def shutDown() = {
    super.shutDown()
    configAgent().foreach(_.close())
  }

  override def warmup() = {
    super.warmup()
    quietly(configAgent.await(Timeout(5 seconds)).foreach(_.warmup()))
  }

  def configuredTrailblocks: List[Trailblock] = configAgent().flatMap(_.trailblock).toList

  private def toBlocks(editionJson: JsValue): Seq[TrailblockDescription] = {
    (editionJson \ "blocks").as[Seq[JsValue]] map { block =>
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