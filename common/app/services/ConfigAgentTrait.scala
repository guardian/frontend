package services

import com.gu.facia.client.models.CollectionConfig
import common._
import play.api.libs.json.{JsNull, Json, JsValue}
import model.{FrontProperties, SeoDataJson}
import scala.concurrent.Future
import scala.concurrent.duration._
import akka.util.Timeout
import conf.Configuration
import play.api.{Application, GlobalSettings}

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
    (getConfigCollectionMap collect {
      case (configId, collectionIds) if collectionIds.contains(id) => configId
    }).toSeq
  }

  def getConfigForId(id: String): Option[List[(String, CollectionConfig)]] = {
    val json = configAgent.get()
    (json \ "fronts" \ id \ "collections").asOpt[List[String]] map { configList =>
      configList.flatMap(collectionId => getConfig(collectionId).map(collectionConfig => collectionId -> collectionConfig))
    }
  }

  def getConfig(id: String): Option[CollectionConfig] = generateConfig(configAgent.get(), id)

  def getConfigAfterUpdates(id: String): Future[Option[CollectionConfig]] =
    configAgent.future().map(configJson => generateConfig(configJson, id))

  private def generateConfig(json: JsValue, id: String): Option[CollectionConfig] = {
    (json \ "collections" \ id).asOpt[JsValue] map { collectionJson =>
      CollectionConfig(
        apiQuery     = (collectionJson \ "apiQuery").asOpt[String],
        displayName  = (collectionJson \ "displayName").asOpt[String].filter(_.nonEmpty),
        href         = (collectionJson \ "href").asOpt[String],
        groups       = (collectionJson \ "groups").asOpt[List[String]],
        `type`       = (collectionJson \ "type").asOpt[String],
        showTags     = (collectionJson \ "showTags").asOpt[Boolean],
        showSections = (collectionJson \ "showSections").asOpt[Boolean],
        uneditable   = None
      )
    }
  }

  def getAllCollectionIds: List[String] = {
    val json = configAgent.get()
    (json \ "collections").asOpt[Map[String, JsValue]] map { collectionMap =>
      collectionMap.keys.toList
    } getOrElse Nil
  }

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

  def fetchFrontProperties(id: String): FrontProperties = {
    val frontPropsJson: JsValue = (configAgent.get() \ "fronts" \ id).as[JsValue]
    def formatValue(fieldName: String) = (frontPropsJson \ fieldName).asOpt[String].filter(_.nonEmpty)
    FrontProperties(
      onPageDescription = formatValue("onPageDescription"),
      imageUrl = formatValue("imageUrl"),
      imageWidth = formatValue("imageWidth"),
      imageHeight = formatValue("imageHeight"),
      isImageDisplayed = (frontPropsJson \ "isImageDisplayed").asOpt[Boolean].getOrElse(false),
      editorialType = None // value found in Content API
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
    super.onStop(app)
  }
}
