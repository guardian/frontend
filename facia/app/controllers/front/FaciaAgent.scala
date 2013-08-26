package controllers.front

import scala.concurrent.Future
import common.{Logging, Edition}
import play.mvc.Http.Response
import views.support.Style
import model.Trail

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

trait ParseConfig {
  def getConfig: Future[Seq[Config]] = ???
  def parseConfig(id: String): Future[Config] = ???
}

trait ParseCollection {
  def getCollection(id: String, edition: Edition): Future[Items] = ???
  private def parseResponse(response: Future[Response], edition: Edition): Future[Items] = ???
}

//, itemCache: Agent[Map[String, Content]]
class Query(id: String, edition: Edition) extends ParseConfig with ParseCollection {

  def getItems: Future[Map[Config, Items]] = for {
    configs <- getConfig
    config <- configs
  } yield config -> getCollection("config.something", edition)
  //getConfig flatMap {config => getCollection(id, edition)}
}

object Query {
  def apply(id: String, edition: Edition): Query = new Query(id, edition)
}

class FaciaAgent(id: String, edition: Edition) extends TrailblockAgent with Logging {

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
