package controllers.front

import scala.concurrent.Future
import common._
import model._
import play.api.libs.ws.WS
import conf.{ContentApi, Configuration}
import play.api.libs.json.Json._
import play.api.libs.json.JsValue
import tools.QueryParams
import model.FaciaTrailblock
import play.api.libs.ws.Response
import model.Config
import scala.Some
import play.api.libs.json.JsObject
import views.support._
import play.api.mvc.AnyContent
import play.mvc.Http.Request

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
  def getConfigMap(id: String): Future[Map[String, Seq[JsValue]]] = {
    val configUrl = s"${Configuration.frontend.store}/${S3FrontsApi.location}/config/$id/config.json"
    WS.url(configUrl).withTimeout(2000).get map { r =>
      val json = parse(r.body)
      json.asOpt[Map[String, Seq[JsValue]]] getOrElse Map.empty
    }
  }
  def getConfig(id: String): Future[Seq[Config]] = getConfigMap(id) map { configMap =>
    configMap.get("collections").getOrElse(Nil).map(parseConfig)
  }

  def parseConfig(json: JsValue): Config =
    Config(
      (json \ "id").as[String],
      (json \ "displayName").as[String],
      (json \ "max").as[String].toInt,
      getStyle((json \ "style").as[String]),
      (json \ "section").as[String],
      (json \ "isConfigured").as[String].toBoolean,
      (json \ "showmore").as[String].toBoolean
    )

  //TODO: Should probably live along side styles with object.apply
  def getStyle(style: String): Option[Style] = style match {
    case s if s == "featured"     => Some(Featured)
    case s if s == "thumbnail"    => Some(Thumbnail)
    case s if s == "headline"     => Some(Headline)
    case s if s == "sectionfront" => Some(SectionFront)
    case s if s == "masthead"     => Some(Masthead)
    case s if s == "fastnews"     => Some(FastNews)
    case s if s == "sectionzone"  => Some(SectionZone)
    case _                        => None
  }
}

trait ParseCollection extends ExecutionContexts with Logging {
  def getCollection(id: String, edition: Edition): Future[Items] = {
    // get the running order from the apiwith
    val collectionUrl = s"${Configuration.frontend.store}/${S3FrontsApi.location}/collection/$id/collection.json"
    log.info(s"loading running order configuration from: $collectionUrl")
    val response: Future[Response] = WS.url(collectionUrl).withTimeout(2000).get()
    parseResponse(response, edition)
  }

  private def parseResponse(response: Future[Response], edition: Edition): Future[Items] = {
    response.flatMap { r =>
      r.status match {
        case 200 =>
          val bodyJson = parse(r.body)
          val max = (bodyJson \ "max").asOpt[Int] getOrElse 15

          // extract the articles
          val articles: Seq[String] = (bodyJson \ "live").as[Seq[JsObject]] map { trail =>
            (trail \ "id").as[String]
          }

          val idSearch = {
            if (articles.isEmpty) {
              Future(Nil)
            }
            else {
              val response = ContentApi.search(edition).ids(articles.mkString(",")).pageSize(List(articles.size, 50).min).response
              val results = response map {r => r.results map{new Content(_)} }
              val sorted = results map { _.sortBy(t => articles.indexWhere(_ == t.id))}
              sorted
            }
          }

          val contentApiQuery = executeContentApiQuery((parse(r.body) \ "contentApiQuery").asOpt[String], edition)

          val results = for {
            idSearchResults <- idSearch
            contentApiResults <- contentApiQuery
          } yield (idSearchResults ++ contentApiResults).take(max)

          results map {
            case l: List[Content] => Items(l.toSeq)
          }
          //TODO: Removal of fallback forces full chain to fail

        case _ =>
          log.warn(s"Could not load running order: ${r.status} ${r.statusText}")
          // NOTE: better way of handling fallback
          Future(Items(Nil))
      }
    }
  }

  def executeContentApiQuery(s: Option[String], edition: Edition): Future[List[Content]] = s map { queryString =>
    val queryParams: Map[String, String] = QueryParams.get(queryString).mapValues{_.mkString("")}
    val queryParamsWithEdition = queryParams + ("edition" -> queryParams.getOrElse("edition", Edition.defaultEdition.id))

    val newSearch = queryString match {
      case Path(Seg("search" ::  Nil)) => {
        val search = ContentApi.search(edition).showFields("all")
        val newSearch = queryParamsWithEdition.foldLeft(search){
          case (query, (key, value)) => query.stringParam(key, value)
        }
        newSearch.response map { r =>
          r.results.map(new Content(_))
        }
      }
      case Path(id)  => {
        val search = ContentApi.item(id, edition).showFields("all")
        val newSearch = queryParamsWithEdition.foldLeft(search){
          case (query, (key, value)) => query.stringParam(key, value)
        }
        newSearch.response map { r =>
          r.results.map(new Content(_))
        }
      }
    }

    newSearch onFailure {case t: Throwable => log.warn("Content API Query failed: %s: %s".format(queryString, t.toString))}
    newSearch
  } getOrElse Future(Nil)

}

//, itemCache: Agent[Map[String, Content]]
class Query(id: String, edition: Edition) extends ParseConfig with ParseCollection {
  private val agent = AkkaAgent[List[(Config, Items)]](Nil)

  def getItems: Future[List[(Config, Items)]] = {
    val f = getConfig(id) map {config =>
      config map {y => y -> getCollection(y.id, edition)}
    }
    f map (_.toVector) flatMap {j =>
      j.foldRight(Future(List[(Config, Items)]()))((a, b) => for{l <- b; i <- a._2.fallbackTo(Future(Items(Nil)))} yield (a._1,  i) +: l)
    }
  }

  def refresh() = getItems map {m =>
    agent.send(m)
  }

  def close() = agent.close()

  def items = agent()
}

object Query {
  def apply(id: String, edition: Edition): Query = new Query(id, edition)
}

class FaciaAgent(id: String, edition: Edition) extends Logging {

  //private val agent: Agent[Query] = AkkaAgent[Query](Query(id, edition))
  private val query: Query = Query(id, edition)

  def refresh() = query.refresh()
  def close() = query.close()
  def trailblock: FaciaTrailblock = FaciaTrailblock(id, query.items) //Await.result(query.getItems, Duration(10000, MILLISECONDS))
}

class PageFront(id: String, edition: Edition) {
  val faciaAgent = new FaciaAgent(id, edition)

  def refresh() = faciaAgent.refresh()
  def close() = faciaAgent.close()

  def apply(): FaciaTrailblock = faciaAgent.trailblock
}
