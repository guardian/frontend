package services

import common.{Logging, Edition, AkkaAgent, ExecutionContexts}
import play.api.libs.json.{JsNull, Json, JsValue}
import model.{SeoData, Config}
import scala.concurrent.Future
import scala.concurrent.duration._
import akka.util.Timeout
import conf.{ContentApi, Configuration}

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

  private def getSeoDataFromConfig(path: String): Option[SeoData] = {
    val json = configAgent.get()
    (json \ "fronts" \ path).asOpt[JsValue].map { frontJson =>
      SeoData(
        path,
        section   = (frontJson \ "section").asOpt[String].filter(_.nonEmpty),
        webTitle  = (frontJson \ "webTitle").asOpt[String].filter(_.nonEmpty),
        title  = (frontJson \ "title").asOpt[String].filter(_.nonEmpty),
        description  = (frontJson \ "description").asOpt[String].filter(_.nonEmpty)
      )
    }
  }

  def getSeoData(path: String): Future[SeoData] = {
    lazy val seoDataFromPath: SeoData = SeoData.fromPath(path)
    val seoDataWithWebTitle = for {
      seoData <- getSeoDataFromConfig(path)
      webTitle <- seoData.webTitle
    } yield seoData.copy(
      title = seoData.title.orElse(Option(SeoData.titleFromWebTitle(webTitle))),
      description = seoData.description.orElse(Option(SeoData.descriptionFromWebTitle(webTitle)))
    )
    seoDataWithWebTitle
      .map(Future.successful)
      .getOrElse(getSectionOrTagWebTitle(path).map { _.map { contentApiWebTitle =>
        log.info(s"Using contentApiWebTitle $contentApiWebTitle")
        SeoData(
          path,
          Option(contentApiWebTitle),
          Option(contentApiWebTitle),
          Option(SeoData.titleFromWebTitle(contentApiWebTitle)),
          Option(SeoData.descriptionFromWebTitle(contentApiWebTitle))
        )
    }.getOrElse(seoDataFromPath)}).recover
    { case _ =>
      log.info(s"Using FromPath for $path")
      seoDataFromPath
    }
  }

  private def getSectionOrTagWebTitle(id: String): Future[Option[String]] =
    ContentApi
      .item(id, Edition.defaultEdition)
      .showEditorsPicks(false)
      .pageSize(0)
      .response
      .map { response =>
        response.tag.map(_.webTitle).orElse(response.section.map(_.webTitle))
      }


}
