package model

import org.joda.time.DateTime
import views.support.Style
import scala.concurrent.Future
import conf.{Configuration, ContentApi}
import common._
import contentapi.QueryDefaults
import play.api.libs.ws.WS
import play.api.libs.json.Json._
import play.api.libs.ws.Response
import play.api.libs.json.JsObject
import tools.QueryParams


trait Trail extends Images with Tags {
  def webPublicationDate: DateTime
  def linkText: String
  def headline: String
  def url: String
  def trailText: Option[String]
  def section: String //sectionId
  def sectionName: String
  def thumbnail: Option[String] = None
  def thumbnailPath: Option[String] = None
  def isLive: Boolean

  def discussionId: Option[String] = None

}

case class Trailblock(description: TrailblockDescription, trails: Seq[Trail])

trait TrailblockDescription extends ExecutionContexts {
  val id: String
  val name: String
  val numItemsVisible: Int
  val style: Option[Style]
  val section: String
  val showMore: Boolean
  val isConfigured: Boolean

  def query(): Future[Seq[Trail]]
}

class ItemTrailblockDescription(
    val id: String, val name: String,
    val numItemsVisible: Int,
    val style: Option[Style],
    val showMore: Boolean,
    val edition: Edition,
    val isConfigured: Boolean) extends TrailblockDescription with QueryDefaults
  {
    lazy val section = id.split("/").headOption.filterNot(_ == "").getOrElse("news")

  def query() = EditorsPicsOrLeadContentAndLatest(
    ContentApi.item(id, edition)
      .showEditorsPicks(true)
      .pageSize(20)
      .response
  )
}

object ItemTrailblockDescription {
  def apply(id: String, name: String, numItemsVisible: Int, style: Option[Style] = None, showMore: Boolean = false, isConfigured: Boolean = false)(implicit edition: Edition) =
    new ItemTrailblockDescription(id, name, numItemsVisible, style, showMore, edition, isConfigured)
}

private case class CustomQueryTrailblockDescription(
            id: String,
            name: String,
            numItemsVisible: Int,
            style: Option[Style],
            customQuery: () => Future[Seq[Trail]],
            isConfigured: Boolean)
    extends TrailblockDescription {

  // show more will not (currently) work with custom queries
  val showMore = false

  lazy val section = id.split("/").headOption.filterNot(_ == "").getOrElse("news")

  def query() = customQuery()
}

object CustomTrailblockDescription {
  def apply(id: String,
            name: String,
            numItemsVisible: Int,
            style: Option[Style] = None,
            isConfigured: Boolean = false)
           (query: => Future[Seq[Trail]]): TrailblockDescription =
    CustomQueryTrailblockDescription(id, name, numItemsVisible, style, () => query, isConfigured)
}


trait ConfiguredTrailblockDescription extends TrailblockDescription {
  def query() = scala.concurrent.future {
    Nil
  }

  def configuredQuery(): Future[Option[TrailblockDescription]]
}

class RunningOrderTrailblockDescription(
  val id: String,
  val blockId: String,
  val name: String,
  val numItemsVisible: Int,
  val style: Option[Style],
  val showMore: Boolean,
  val edition: Edition,
  val isConfigured: Boolean
) extends ConfiguredTrailblockDescription with AkkaSupport with Logging {

  lazy val section = id.split("/").headOption.filterNot(_ == "").getOrElse("news")

  def configuredQuery() = {
    // get the running order from the api
    val configUrl = s"${Configuration.frontend.store}/${S3FrontsApi.location}/collection/$blockId/collection.json"
    log.info(s"loading running order configuration from: $configUrl")
    parseResponse(WS.url(s"$configUrl").withTimeout(2000).get())
  }

  private def parseResponse(response: Future[Response]): Future[Option[TrailblockDescription]] = {
    response.map{ r =>
      r.status match {
        case 200 =>
          Some(CustomTrailblockDescription(id, name, numItemsVisible, style, isConfigured){
            // extract the articles
            val articles: Seq[String] = (parse(r.body) \ "live").as[Seq[JsObject]] map { trail =>
              (trail \ "id").as[String]
            }

            val idSearch = {
              val response = ContentApi.search(edition).ids(articles.mkString(",")).pageSize(List(articles.size, 50).min).response
              val results = response map {r => r.results map{new Content(_)} }
              val sorted = results map { _.sortBy(t => articles.indexWhere(_ == t.id))}
              sorted fallbackTo Future(Nil)
            }

            val contentApiQuery = (parse(r.body) \ "contentApiQuery").asOpt[String] map { query =>
              val queryParams: Map[String, String] = QueryParams.get(query).mapValues{_.mkString("")}
              val queryParamsWithEdition = queryParams + ("edition" -> queryParams.getOrElse("edition", Edition.defaultEdition.id))
              ContentApi.fetch(Configuration.contentApi.host + "/search", queryParamsWithEdition).flatMap { resp =>
              val ids = (parse(resp) \\ "id") map {_.as[String] } mkString(",")
              ContentApi.search(edition)
                .ids(ids)
                .response map { r =>
                  r.results.map(new Content(_))
                }
              }.fallbackTo(Future(Nil))
            } getOrElse Future(Nil)

            for {
                idSearchResults <- idSearch
                contentApiResults <- contentApiQuery
            } yield idSearchResults ++ contentApiResults

          })
        case _ =>
          log.warn(s"Could not load running order: ${r.status} ${r.statusText}")
          // NOTE: better way of handling fallback
          Some(ItemTrailblockDescription(id, name, numItemsVisible)(edition))
      }
    }
  }

}

object RunningOrderTrailblockDescription {
  def apply(id: String, blockId: String, name: String, numItemsVisible: Int, style: Option[Style] = None, showMore: Boolean = false, isConfigured: Boolean = false)(implicit edition: Edition) =
    new RunningOrderTrailblockDescription(id, blockId, name, numItemsVisible, style, showMore, edition, isConfigured)
}
