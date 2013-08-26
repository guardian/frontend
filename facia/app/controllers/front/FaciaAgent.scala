package controllers.front

import scala.concurrent.Future
import common.{S3FrontsApi, ExecutionContexts, Logging, Edition}
import views.support.Style
import model.{Content, Trail}
import play.api.libs.ws.{Response, WS}
import conf.{ContentApi, Configuration}
import play.api.libs.json.Json._
import play.api.libs.json.JsObject
import tools.QueryParams

sealed case class Config(
                          id: String,
                          name: String,
                          numItemsVisible: Int,
                          style: Option[Style],
                          section: String,
                          showMore: Boolean,
                          isConfigured: Boolean)
sealed case class Items(items: Seq[Trail])

sealed case class FaciaTrailblock(
  collections: Map[Config, Items]
                                 )

trait ParseConfig extends ExecutionContexts {
  def getConfigMap(id: String): Future[Map[String, String]] = {
    val configUrl = s"${Configuration.frontend.store}/${S3FrontsApi.location}/config/$id/config.json"
    WS.url(configUrl).withTimeout(2000).get map { r =>
      val json = parse(r.body)
      json.asOpt[Map[String, String]] getOrElse Map.empty
    }
  }
  def getConfig(id: String): Future[Seq[Config]] = getConfigMap(id) map { m =>
    Seq(Config(
      id,
      m.get("name") getOrElse "Lifeandstyle",
      m.get("max") map (_.toInt) getOrElse 10,
      None,
      "Lifeandstyle",
      false,
      false
    ))
  }
  def parseConfig(id: String): Future[Config] = ???
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
          val numItems = (bodyJson \ "max").asOpt[Int] getOrElse 10
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
              response.onFailure{case t: Throwable => log.warn("ID Search Fail: %s".format(t))}
              val results = response map {r => r.results map{new Content(_)} }
              val sorted = results map { _.sortBy(t => articles.indexWhere(_ == t.id))}
              sorted
            }
          }

          val contentApiQuery = (parse(r.body) \ "contentApiQuery").asOpt[String] map { query =>
            val queryParams: Map[String, String] = QueryParams.get(query).mapValues{_.mkString("")}
            val queryParamsWithEdition = queryParams + ("edition" -> queryParams.getOrElse("edition", Edition.defaultEdition.id))
            val search = ContentApi.search(edition)
            val queryParamsAsStringParams = queryParamsWithEdition map {case (k, v) => k -> search.StringParameter(k, Some(v))}
            val newSearch = search.updated(search.parameterHolder ++ queryParamsAsStringParams)

            newSearch.response.onFailure{case t: Throwable => log.warn("Content API Query: %s".format(t))}

            newSearch.response map { r =>
              r.results.map(new Content(_))
            }
          } getOrElse Future(Nil)

          val results = for {
            idSearchResults <- idSearch
            contentApiResults <- contentApiQuery
          } yield idSearchResults ++ contentApiResults

          results map {
            case l: List[Content] => Items(l.toSeq)
          } fallbackTo Future(Items(Nil))

        case _ =>
          log.warn(s"Could not load running order: ${r.status} ${r.statusText}")
          // NOTE: better way of handling fallback
          Future(Items(Nil))
      }
    }
  }
}

//, itemCache: Agent[Map[String, Content]]
class Query(id: String, edition: Edition) extends ParseConfig with ParseCollection {

  def getItems: Future[Map[Config, Items]] = {
    val f = getConfig(id) map {config =>
      config map {y => y -> getCollection(y.id, edition)}
    }
    f map (_.toVector) flatMap {j =>
      j.foldRight(Future(Map[Config, Items]()))((a, b) => for{l <- b; i <- a._2} yield l + (a._1 -> i))
    }
  }
}

object Query {
  def apply(id: String, edition: Edition): Query = new Query(id, edition)
}

class FaciaAgent(id: String, edition: Edition) extends Logging {

  //private val agent: Agent[Query] = AkkaAgent[Query](Query(id, edition))
  private val query: Query = Query(id, edition)

  def refresh() = {}
  def close() = {}
  def trailblock: Option[FaciaTrailblock] = None //Await.result(query.getItems, Duration(10000, MILLISECONDS))
}

class PageFront(id: String, edition: Edition) {
  val faciaAgent = new FaciaAgent(id, edition)

  //TODO: Option? It's going to be a Map
  def apply(): Option[FaciaTrailblock] = faciaAgent.trailblock
}
