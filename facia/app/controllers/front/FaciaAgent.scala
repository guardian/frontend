package controllers.front

import scala.concurrent.Future
import common._
import model._
import play.api.libs.ws.WS
import conf.{ContentApi, Configuration}
import play.api.libs.json.Json._
import play.api.libs.json.JsValue
import model.FaciaPage
import play.api.libs.ws.Response
import model.Config
import scala.Some
import play.api.libs.json.JsObject
import services.S3FrontsApi
import views.support._

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
    WS.url(configUrl).withTimeout(2000).get map { r =>
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
      (json \ "displayName").as[String],
      (json \ "max").as[String].toInt,
      getStyle((json \ "style").as[String]),
      (json \ "section").as[String],
      (json \ "showmore").as[String].toBoolean
    )

  //TODO: Should probably live along side styles with object.apply
  def getStyle(style: String): Option[Style] = style match {
    case "featured"      => Some(Featured)
    case "thumbnail"     => Some(Thumbnail)
    case "headline"      => Some(Headline)
    case "sectionfront"  => Some(SectionFront)
    case "masthead"      => Some(Masthead)
    case "topStories"    => Some(TopStories)
    case "mediumStories" => Some(MediumStories)
    case "smallStories"  => Some(SmallStories)
    case "highlights"    => Some(Highlights)
    case _               => None
  }
}

trait ParseCollection extends ExecutionContexts with Logging {
  private lazy val defaultMax = 15

  def getCollection(id: String, edition: Edition): Future[Collection] = {
    // get the running order from the apiwith
    val collectionUrl = s"${Configuration.frontend.store}/${S3FrontsApi.location}/collection/$id/collection.json"
    log.info(s"loading running order configuration from: $collectionUrl")
    val response: Future[Response] = WS.url(collectionUrl).withTimeout(2000).get()
    parseResponse(response, edition)
  }

  private def parseResponse(response: Future[Response], edition: Edition): Future[Collection] = {
    response.flatMap { r =>
      r.status match {
        case 200 =>
          val bodyJson = parse(r.body)
          val max = (bodyJson \ "max").asOpt[Int] getOrElse defaultMax

          // extract the articles
          val articles: Seq[String] = (bodyJson \ "live").as[Seq[JsObject]] map { trail =>
            (trail \ "id").as[String]
          }

          val idSearch = getArticles(articles, edition)

          val contentApiQuery = executeContentApiQuery((parse(r.body) \ "contentApiQuery").asOpt[String], edition)

          val results = for {
            idSearchResults <- idSearch
            contentApiResults <- contentApiQuery
          } yield (idSearchResults ++ contentApiResults).take(max)

          results map {
            case l: List[Content] => Collection(l.toSeq)
          }
          //TODO: Removal of fallback forces full chain to fail

        case _ =>
          log.warn(s"Could not load running order: ${r.status} ${r.statusText}")
          // NOTE: better way of handling fallback
          Future(Collection(Nil))
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

class Query(id: String, edition: Edition) extends ParseConfig with ParseCollection {
  private lazy val queryAgent = AkkaAgent[List[(Config, Collection)]](Nil)

  def getItems: Future[List[(Config, Collection)]] = {
    val futureConfig = getConfig(id) map {config =>
      config map {c => c -> getCollection(c.id, edition)}
    }
    futureConfig map (_.toVector) flatMap { configMapping =>
        configMapping.foldRight(Future(List[(Config, Collection)]()))((configMap, foldList) =>
          for {
            newList <- foldList
            collection <- configMap._2
          }
          yield (configMap._1, collection) +: newList)
    }
  }

  def refresh() = getItems map {m =>
    queryAgent.send(m)
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

  def apply(): FaciaPage = FaciaPage(id, query.items)
}

trait ConfigAgent extends ExecutionContexts {
  private val configAgent = AkkaAgent[List[String]](Nil)

  def refresh() = Future {
    val ids: List[String] = S3FrontsApi.listConfigsIds
    configAgent.send(ids)
  }

  def close() = configAgent.close()

  def apply(): List[String] = configAgent()
}

object ConfigAgent extends ConfigAgent
