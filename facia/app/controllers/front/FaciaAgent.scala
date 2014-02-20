package controllers.front

import common._
import conf.{ SwitchingContentApi=>ContentApi, Configuration }
import model._
import play.api.libs.json.Json._
import play.api.libs.json._
import play.api.libs.ws.{ WS, Response }
import play.api.libs.json.JsObject
import services.{ParseCollection, ConfigAgentTrait, SecureS3Request, S3FrontsApi}
import scala.concurrent.Future
import common.FaciaMetrics.S3AuthorizationError
import scala.collection.immutable.SortedMap
import akka.agent.Agent
import org.joda.time.DateTime

object Path {
  def unapply[T](uri: String) = Some(uri.split('?')(0))
  def apply[T](uri: String) = uri.split('?')(0)
}

object Seg {
  def unapply(path: String): Option[List[String]] = path.split("/").toList match {
    case "" :: rest => Some(rest)
    case all => Some(all)
  }
}

trait ParseConfig extends ExecutionContexts with Logging {

  def requestConfig(id: String): Future[Response] = {
    val configUrl = s"${Configuration.frontend.store}/${S3FrontsApi.location}/config/$id/config.json"
    WS.url(configUrl).withRequestTimeout(2000).get()
  }

  def getConfigMap(id: String): Future[Seq[JsValue]] = {
     requestConfig(id) map { r =>
      try {
        val json = parse(r.body)
        json.asOpt[Seq[JsValue]] getOrElse Nil
      } catch {
        case e: Throwable => {
          log.warn("Could not parse config for %s".format(id))
          FaciaMetrics.JsonParsingErrorCount.increment()
          throw e
        }
      }
    }
  }

  def getConfig(id: String): Future[Seq[Config]] = getConfigMap(id) map { configMap =>
    configMap.map(parseConfig)
  }

  def parseConfig(json: JsValue): Config =
    Config(
      (json \ "id").as[String],
      (json \ "contentApiQuery").asOpt[String].filter(_.nonEmpty),
      (json \ "displayName").asOpt[String],
      (json \ "tone").asOpt[String],
      (json \ "href").asOpt[String],
      (json \ "groups").asOpt[Seq[String]] getOrElse Nil,
      (json \ "roleName").asOpt[String],
      (json \ "type").asOpt[String]
    )

}

object CollectionAgent extends ParseCollection {
  private val collectionAgent = AkkaAgent[Map[String, Collection]](Map.empty)

  def getCollection(id: String): Option[Collection] = collectionAgent.get().get(id)

  def updateCollection(id: String, config: Config, edition: Edition, isWarmedUp: Boolean): Unit = {
    getCollection(id, config, edition, isWarmedUp) foreach { collection => updateCollection(id, collection) }
  }

  def updateCollection(id: String, collection: Collection): Unit = collectionAgent.send { _.updated(id, collection) }

  def updateCollectionById(id: String): Unit = updateCollectionById(id, isWarmedUp=true)

  def updateCollectionById(id: String, isWarmedUp: Boolean): Unit = {
    val config: Config = ConfigAgent.getConfig(id).getOrElse(Config(id))
    val edition = Edition.byId(id.take(2)).getOrElse(Edition.defaultEdition)
    //TODO: Refactor isWarmedUp into method by ID
    updateCollection(id, config, edition, isWarmedUp=isWarmedUp)
  }

  def close(): Unit = collectionAgent.close()

  def contentsAsJsonString: String = {
    val contents: SortedMap[String, Seq[String]] = SortedMap(collectionAgent.get().mapValues{v => v.items.map(_.url)}.toSeq:_*)
    Json.prettyPrint(Json.toJson(contents))
  }
}

object QueryAgents {

  def items(id: String): Option[List[(Config, Collection)]] = ConfigAgent.getConfigForId(id).map { configList => configList flatMap { config =>
      CollectionAgent.getCollection(config.id) map { (config, _) }
    }
  } filter(_.exists(_._2.items.nonEmpty))

  def apply(id: String): Option[FaciaPage] = items(id).map(FaciaPage(id, _))
}

object ConfigAgent extends ConfigAgentTrait with ExecutionContexts {
  val configAgent: Agent[JsValue] = AkkaAgent[JsValue](FaciaDefaults.getDefaultConfig)
}
