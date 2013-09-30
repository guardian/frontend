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

trait ParseConfig extends ExecutionContexts {
  def getConfigMap(id: String): Future[Seq[JsValue]] = {
    val configUrl = s"${Configuration.frontend.store}/${S3FrontsApi.location}/config/$id/config.json"
    WS.url(configUrl).withRequestTimeout(2000).get map { r =>
      val json = parse(r.body)
      json.asOpt[Seq[JsValue]] getOrElse Nil
    }
  }
  def getConfig(id: String): Future[Seq[Config]] = getConfigMap(id) map { configMap =>
    configMap.map(parseConfig)
  }

  def parseConfig(json: JsValue): Config =
    Config(
      (json \ "id").as[String],
      (json \ "contentApiQuery").asOpt[String].filter(_.nonEmpty),
      (json \ "displayName").asOpt[String]
    )

}

trait ParseCollection extends ExecutionContexts with Logging {
  private lazy val defaultMax = 15

  def getCollection(id: String, config: Config, edition: Edition): Future[Collection] = {
    // get the running order from the apiwith
    val collectionUrl = s"${Configuration.frontend.store}/${S3FrontsApi.location}/collection/$id/collection.json"
    log.info(s"loading running order configuration from: $collectionUrl")
    val response: Future[Response] = WS.url(collectionUrl).withRequestTimeout(2000).get()
    for {
      collectionList <- parseResponse(response, edition)
      displayName    <- parseDisplayName(response).fallbackTo(Future.successful(None))
      contentApiList <- executeContentApiQuery(config.contentApiQuery, edition)
    } yield Collection(collectionList ++ contentApiList, displayName)
  }

  private def parseDisplayName(response: Future[Response]): Future[Option[String]] = response.map {r =>
    (parse(r.body) \ "displayName").asOpt[String].filter(_.nonEmpty)
  }

  private def parseResponse(response: Future[Response], edition: Edition): Future[List[Content]] = {
    response.flatMap { r =>
      r.status match {
        case 200 =>
          val bodyJson = parse(r.body)

          // extract the articles
          val articles: Seq[String] = (bodyJson \ "live").as[Seq[JsObject]] map { trail =>
            (trail \ "id").as[String]
          }

          getArticles(articles, edition)

        case _ =>
          log.warn(s"Could not load running order: ${r.status} ${r.statusText}")
          // NOTE: better way of handling fallback
          Future(Nil)
      }
    }
  }

  def getArticles(articles: Seq[String], edition: Edition): Future[List[Content]] = {
    if (articles.isEmpty) {
      Future(Nil)
    }
    else {
      val results = articles.foldLeft(Future[List[Content]](Nil)){(foldList, id) =>
        val response = ContentApi.item(id, edition).showFields("all").response
        response.onFailure{case t: Throwable => log.warn("%s: %s".format(id, t.toString))}
        for {l <- foldList; itemResponse <- response} yield {
          itemResponse.content.map(Content(_)).map(_ +: l).getOrElse(l)
        }
      }
      val sorted = results map { _.sortBy(t => articles.indexWhere(_ == t.id))}
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

class Query(id: String, edition: Edition) extends ParseConfig with ParseCollection with Logging {
  private lazy val queryAgent = AkkaAgent[Option[List[(Config, Collection)]]](None)

  def getItems: Future[List[(Config, Either[Throwable, Collection])]] = {
    val futureConfig = getConfig(id) map {config =>
      config map {c => c -> getCollection(c.id, c, edition)}
    }

    futureConfig.map(_.toVector).flatMap{ configMapping =>
        configMapping.foldRight(Future(List[(Config, Either[Throwable, Collection])]()))((configMap, foldList) =>
          for {
            newList <- foldList
            collection <- {configMap._2.map(Right(_)).recover{case t: Throwable => Left(t)}}
          }
          yield (configMap._1, collection) +: newList)
    }
  }

  def refresh() =
    getItems map { newConfigList =>
      queryAgent.send { oldConfigList =>
        lazy val oldConfigMap = oldConfigList.map{_.map{case (config, collection) => (config.id, collection)}.toMap}
        Option {
          newConfigList flatMap { collectionConfig =>
            collectionConfig match {
              case (config, Left(exception)) => {
                log.warn("Updating ID %s failed".format(config.id))
                oldConfigMap.flatMap{_.get(config.id).map(oldCollection => (config, oldCollection))}
              }
              case (config, Right(newCollection)) => Some((config, newCollection))
            }
          }
        }
      }
    }


  def close() = queryAgent.close()

  def items = queryAgent()
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
  private val configAgent = AkkaAgent[List[String]](Nil)

  def refresh() =
    S3FrontsApi.listConfigsIds map { ids =>
      configAgent.send(ids)
    }

  def close() = configAgent.close()

  def apply(): List[String] = configAgent()
}

object ConfigAgent extends ConfigAgent
