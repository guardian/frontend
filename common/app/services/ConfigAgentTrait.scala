package services

import common._
import play.api.libs.json.{JsNull, Json, JsValue}
import model.Config
import scala.concurrent.Future
import scala.concurrent.duration._
import akka.util.Timeout
import conf.Configuration
import play.api.{Application, GlobalSettings}
import model.SeoDataJson

trait ConfigAgentTrait extends ExecutionContexts with Logging {
  implicit val alterTimeout: Timeout = Configuration.faciatool.configBeforePressTimeout.millis
  private lazy val configAgent = AkkaAgent[JsValue](JsNull)

  def refresh() = S3FrontsApi.getMasterConfig map {s => configAgent.send(Json.parse(s))}

  def refreshWith(json: JsValue): Unit = configAgent.send(json)

  def refreshAndReturn(): Future[JsValue] =
    S3FrontsApi.getMasterConfig
      .map(Json.parse)
      .map(json => configAgent.alter{_ => json})
      .getOrElse(Future.successful(configAgent.get()))

  def getPathIds: List[String] = {
    val json = configAgent.get()
    (json \ "fronts").asOpt[Map[String, JsValue]].map { _.keys.toList } getOrElse Nil
  }

  def getConfigCollectionMap: Map[String, Seq[String]] = {
    val json = configAgent.get()
    (json \ "fronts").asOpt[Map[String, JsValue]].map { m =>
      m.mapValues{j => (j \ "collections").asOpt[Seq[String]].getOrElse(Nil)}
    } getOrElse Map.empty
  }

  def getConfigsUsingCollectionId(id: String): Seq[String] = {
    getConfigCollectionMap.collect{
      case (configId, collectionIds) if collectionIds.contains(id) => configId
    }.toSeq
  }

  def getConfigForId(id: String): Option[List[Config]] = {
    val json = configAgent.get()
    (json \ "fronts" \ id \ "collections").asOpt[List[String]] map { configList =>
      configList flatMap getConfig
    }
  }

  def getConfig(id: String): Option[Config] = {
    val json = configAgent.get()
    (json \ "collections" \ id).asOpt[JsValue] map { collectionJson =>
      Config(
        id,
        (collectionJson \ "apiQuery").asOpt[String],
        (collectionJson \ "displayName").asOpt[String].filter(_.nonEmpty),
        (collectionJson \ "href").asOpt[String],
        (collectionJson \ "groups").asOpt[Seq[String]] getOrElse Nil,
        (collectionJson \ "type").asOpt[String],
        (collectionJson \ "showTags").asOpt[Boolean] getOrElse false,
        (collectionJson \ "showSections").asOpt[Boolean] getOrElse false
      )
    }
  }

  def getAllCollectionIds: List[String] = {
    val json = configAgent.get()
    (json \ "collections").asOpt[Map[String, JsValue]] map { collectionMap =>
      collectionMap.keys.toList
    } getOrElse Nil
  }

  def close() = configAgent.close()

  def contentsAsJsonString: String = Json.prettyPrint(configAgent.get)

  def getSeoDataJsonFromConfig(path: String): SeoDataJson = {
    val json = configAgent.get()
    val frontJson = (json \ "fronts" \ path).as[JsValue]
    SeoDataJson(
      path,
      navSection   = (frontJson \ "navSection").asOpt[String].filter(_.nonEmpty),
      webTitle  = (frontJson \ "webTitle").asOpt[String].filter(_.nonEmpty),
      title  = (frontJson \ "title").asOpt[String].filter(_.nonEmpty),
      description  = (frontJson \ "description").asOpt[String].filter(_.nonEmpty)
    )
  }
}

object ConfigAgent extends ConfigAgentTrait

trait ConfigAgentLifecycle extends GlobalSettings {

  override def onStart(app: Application) {
    super.onStart(app)

    Jobs.deschedule("ConfigAgentJob")
    Jobs.schedule("ConfigAgentJob", "0 * * * * ?") {
      ConfigAgent.refresh()
    }

    AkkaAsync {
      ConfigAgent.refresh()
    }
  }

  override def onStop(app: Application) {
    Jobs.deschedule("ConfigAgentJob")
    ConfigAgent.close()

    super.onStop(app)
  }
}