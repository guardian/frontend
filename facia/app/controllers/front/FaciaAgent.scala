package controllers.front

import common._
import conf.{ ContentApi, Configuration }
import model._
import play.api.libs.json.Json._
import play.api.libs.json._
import play.api.libs.ws.{ WS, Response }
import play.api.libs.json.JsObject
import services.S3FrontsApi
import scala.concurrent.Future

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

  def getConfig(id: String): Future[List[Config]] = getConfigMap(id) map { configMap =>
    configMap.map(parseConfig).toList
  }

  def parseConfig(json: JsValue): Config =
    Config(
      (json \ "id").as[String],
      (json \ "contentApiQuery").asOpt[String].filter(_.nonEmpty),
      (json \ "displayName").asOpt[String]
    )

}

trait ParseCollection extends ExecutionContexts with Logging {

  case class CollectionItem(id: String, metaData: Option[Map[String, String]])

  def requestCollection(id: String): Future[Response] = {
    val collectionUrl = s"${Configuration.frontend.store}/${S3FrontsApi.location}/collection/$id/collection.json"
    log.info(s"loading running order configuration from: $collectionUrl")
    WS.url(collectionUrl).withRequestTimeout(2000).get()
  }

  def getCollection(id: String, config: Config, edition: Edition, isWarmedUp: Boolean): Future[Collection] = {
    // get the running order from the apiwith
    val response = requestCollection(id)
    for {
      collectionList <- getCuratedList(response, edition, id, isWarmedUp)
      displayName    <- parseDisplayName(response).fallbackTo(Future.successful(None))
      contentApiList <- executeContentApiQuery(config.contentApiQuery, edition)
    } yield Collection(collectionList ++ contentApiList, displayName)
  }

  def getCuratedList(response: Future[Response], edition: Edition, id: String, isWarmedUp: Boolean): Future[List[Content]] = {
    val curatedList: Future[List[Content]] = parseResponse(response, edition, id)
    //Potential to fail the chain if we are warmed up
    if (isWarmedUp)
      curatedList
    else
      curatedList fallbackTo { Future.successful(Nil) }
  }

  private def parseDisplayName(response: Future[Response]): Future[Option[String]] = response.map {r =>
    (parse(r.body) \ "displayName").asOpt[String].filter(_.nonEmpty)
  }

  private def parseResponse(response: Future[Response], edition: Edition, id: String): Future[List[Content]] = {
    response.flatMap { r =>
      r.status match {
        case 200 =>
          try {
            val bodyJson = parse(r.body)

            // extract the articles
            val articles: Seq[CollectionItem] = (bodyJson \ "live").as[Seq[JsObject]] map { trail =>
              CollectionItem((trail \ "id").as[String], (trail \ "meta").asOpt[Map[String, String]])
            }

            getArticles(articles, edition)
          } catch {
            case e: Throwable => {
              log.warn("Could not parse collection JSON for %s".format(id))
              FaciaMetrics.JsonParsingErrorCount.increment()
              throw e
            }
          }
        case (httpResponseCode: Int) if httpResponseCode >= 500 =>
          Future.failed(throw new Exception("S3 returned a 5xx"))
        case _ =>
          log.warn(s"Could not load running order: ${r.status} ${r.statusText}")
          // NOTE: better way of handling fallback
          Future(Nil)
      }
    }
  }

  def getArticles(collectionItems: Seq[CollectionItem], edition: Edition): Future[List[Content]] = {
    if (collectionItems.isEmpty) {
      Future(Nil)
    }
    else {
      val results = collectionItems.foldLeft(Future[List[Content]](Nil)){(foldList, collectionItem) =>
        val id = collectionItem.id
        val response = ContentApi.item(id, edition).showFields("all").response
        response.onFailure{case t: Throwable => log.warn("%s: %s".format(id, t.toString))}
        for {l <- foldList; itemResponse <- response} yield {
          itemResponse.content.map(Content(_, collectionItem.metaData)).map(_ +: l).getOrElse(l)
        }
      }
      val sorted = results map { _.sortBy(t => collectionItems.indexWhere(_.id == t.id))}
      sorted
    }
  }

  def executeContentApiQuery(s: Option[String], edition: Edition): Future[List[Content]] = s filter(_.nonEmpty) map { queryString =>
    val queryParams: Map[String, String] = QueryParams.get(queryString).mapValues{_.mkString("")}
    val queryParamsWithEdition = queryParams + ("edition" -> queryParams.getOrElse("edition", Edition.defaultEdition.id))

    val newSearch = queryString match {
      case Path(Seg("search" ::  Nil)) => {
        val search = ContentApi.search(edition)
        val newSearch = queryParamsWithEdition.foldLeft(search){
          case (query, (key, value)) => query.stringParam(key, value)
        }.showFields("all")
        newSearch.response map { r =>
          r.results.map(Content(_))
        }
      }
      case Path(id)  => {
        val search = ContentApi.item(id, edition)
        val newSearch = queryParamsWithEdition.foldLeft(search){
          case (query, (key, value)) => query.stringParam(key, value)
        }.showFields("all")
        newSearch.response map { r =>
          r.editorsPicks.map(Content(_)) ++ r.results.map(Content(_))
        }
      }
    }

    newSearch onFailure {case t: Throwable => log.warn("Content API Query failed: %s: %s".format(queryString, t.toString))}
    newSearch
  } getOrElse Future(Nil)

}

object CollectionCache extends ParseCollection {
  private val collectionCache = AkkaAgent[Map[String, Collection]](Map.empty)

  def getCollection(id: String): Option[Collection] = collectionCache.get().get(id)

  def updateCollection(id: String, config: Config, edition: Edition, isWarmedUp: Boolean): Unit = {
    getCollection(id, config, edition, isWarmedUp) map { collection => updateCollection(id, collection) }
  }

  def updateCollection(id: String, collection: Collection): Unit = collectionCache.send { _.updated(id, collection) }

  def close(): Unit = collectionCache.close()
}

class Query(id: String, edition: Edition) extends ParseConfig with Logging {
  val queryAgent = AkkaAgent[Option[List[Config]]](Option(List(FaciaDefaults.configTuple(id))))

  def getItems: Future[List[Config]] =
    getConfig(id) fallbackTo {
      log.warn("Error getting config from S3: %s".format(id))
      val result: List[Config] = queryAgent().getOrElse(Nil)
      Future.successful(result)
    }

  def refresh(): Unit =
    getItems map { newConfigList =>
      queryAgent send Some(newConfigList)
      val isWarmedUp = items.isDefined
      newConfigList map {c => c -> CollectionCache.updateCollection(c.id, c, edition, isWarmedUp)}
    }


  def close() = queryAgent.close()

  def items = queryAgent().map { configList => configList flatMap { config =>
      CollectionCache.getCollection(config.id) map { (config, _) }
    }
  } filter(_.exists(_._2.items.nonEmpty))
}

object Query {
  def apply(id: String, edition: Edition): Query = new Query(id, edition)
}

class PageFront(val id: String, edition: Edition) {
  val query = Query(id, edition)

  def refresh() = query.refresh()
  def close() = query.close()

  def apply(): Option[FaciaPage] = query.items.map(FaciaPage(id, _))
}

trait ConfigAgent extends ExecutionContexts {
  private val configAgent = AkkaAgent[JsValue](JsNull)

  def refresh() = S3FrontsApi.getMasterConfig map {s => configAgent.send(Json.parse(s))}

  def getPathIds: List[String] = {
    val json = configAgent.get()
    (json \ "fronts").asOpt[Map[String, JsValue]].map { _.keys.toList } getOrElse Nil
  }

  def getConfigForId(id: String): Option[List[Config]] = {
    val json = configAgent.get()
    (json \ "fronts" \ id \ "collections").asOpt[List[String]] map { configList =>
      configList flatMap getConfig
    }
  }

  def getConfig(id: String): Option[Config] = {
    val json = configAgent.get()
    (json \ "collections" \ id).asOpt[Map[String, String]] map { collectionMap =>
      Config(
        id,
        collectionMap.get("apiQuery"),
        collectionMap.get("displayName")
      )
    }
  }

  def close() = configAgent.close()

  def apply(): List[String] = Nil
}

object ConfigAgent extends ConfigAgent
