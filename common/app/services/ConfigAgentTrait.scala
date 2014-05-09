package services

import common.{Logging, Edition, AkkaAgent, ExecutionContexts}
import play.api.libs.json.{JsNull, Json, JsValue}
import model.{SeoData, Config}
import scala.concurrent.Future
import scala.concurrent.duration._
import akka.util.Timeout
import conf.{ContentApi, Configuration}
import com.gu.openplatform.contentapi.model.ItemResponse

trait ConfigAgentTrait extends ExecutionContexts with Logging {
  implicit val alterTimeout: Timeout = Configuration.faciatool.configBeforePressTimeout.millis
  private val configAgent = AkkaAgent[JsValue](JsNull)

  def refresh() = S3FrontsApi.getMasterConfig map {s => configAgent.send(Json.parse(s))}

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

  private def getSeoDataFromConfig(path: String): SeoData = {
    val json = configAgent.get()
    val frontJson = (json \ "fronts" \ path).as[JsValue]
    SeoData(
      path,
      section   = (frontJson \ "section").asOpt[String].filter(_.nonEmpty),
      webTitle  = (frontJson \ "webTitle").asOpt[String].filter(_.nonEmpty),
      title  = (frontJson \ "title").asOpt[String].filter(_.nonEmpty),
      description  = (frontJson \ "description").asOpt[String].filter(_.nonEmpty)
    )
  }

  def getSeoData(path: String): Future[SeoData] = {
    val seoDataFromConfig:   Future[SeoData] = Future.successful(getSeoDataFromConfig(path))
    val itemResponseForPath: Future[Option[ItemResponse]] = getSectionOrTagWebTitle(path)
    val seoDataFromPath:     Future[SeoData] = Future.successful(SeoData.fromPath(path))

    for {
      sc <- seoDataFromConfig
      ir <- itemResponseForPath
      sp <- seoDataFromPath
    } yield {
      val section:  Option[String] = sc.section.orElse(ir.flatMap(_.section.map(_.id)).orElse(ir.flatMap(_.tag.flatMap(_.sectionId)))).orElse(sp.section)
      val webTitle: Option[String] = sc.webTitle.orElse(ir.flatMap(_.tag.map(_.webTitle))).orElse(sp.webTitle)
      val title: Option[String] = webTitle.map(SeoData.titleFromWebTitle)
      val description: Option[String] = webTitle.map(SeoData.descriptionFromWebTitle)

      SeoData(path, section, webTitle, title, description)
    }
  }

  private def getSectionOrTagWebTitle(id: String): Future[Option[ItemResponse]] =
    ContentApi
      .item(id, Edition.defaultEdition)
      .showEditorsPicks(false)
      .pageSize(0)
      .response
      .map(Option.apply)
      .fallbackTo(Future.successful(None))


}
