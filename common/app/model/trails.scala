package model

import conf.{Configuration, ContentApi}
import common._
import contentapi.QueryDefaults
import org.joda.time.DateTime
import play.api.libs.ws.{ WS, Response }
import play.api.libs.json.Json._
import play.api.libs.json.JsObject
import scala.concurrent.Future
import services.S3FrontsApi
import views.support.Style


trait Trail extends Elements with Tags {
  def webPublicationDate: DateTime
  def linkText: String
  def headline: String
  def url: String
  def trailText: Option[String]
  def section: String //sectionId
  def sectionName: String
  def thumbnailPath: Option[String] = None
  def isLive: Boolean
  def discussionId: Option[String] = None
  def isClosedForComments: Boolean = false
  def leadingParagraphs: List[org.jsoup.nodes.Element] = Nil
  def byline: Option[String] = None
  def trailType: Option[String] = None
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
    val isConfigured: Boolean) extends TrailblockDescription with QueryDefaults with Logging
  {
    lazy val section = id.split("/").headOption.filterNot(_ == "").getOrElse("news")

  def query() = {
    log.info(s"Refreshing trailblock items for: ${edition.id}, $id")
    EditorsPicsOrLeadContentAndLatest(
      ContentApi.item(id, edition)
        .showEditorsPicks(true)
        .pageSize(20)
        .response
    )
  }
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
            showMore: Boolean = false,
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
) extends ConfiguredTrailblockDescription with Logging {

  lazy val section = id.split("/").headOption.filterNot(_ == "").getOrElse("news")

  def configuredQuery() = {
    // get the running order from the api
    val configUrl = s"${Configuration.frontend.store}/${S3FrontsApi.location}/collection/$blockId/collection.json"
    log.info(s"loading running order configuration from: $configUrl")
    parseResponse(WS.url(s"$configUrl").withRequestTimeout(2000).get())
  }

  private def parseResponse(response: Future[Response]): Future[Option[TrailblockDescription]] = {
    response.flatMap { r =>
      r.status match {
          case 200 =>
            // extract the articles
            val articles: Seq[String] = (parse(r.body) \ "live").as[Seq[JsObject]] map { trail =>
              (trail \ "id").as[String]
            }

            val idSearch = {
              if (articles.isEmpty) {
                Future(Nil)
              } else {
                val response = ContentApi.search(edition).ids(articles.mkString(",")).showFields("all").pageSize(List(articles.size, 50).min).response
                val results = response map {r => r.results map{Content(_)} }
                val sorted = results map { _.sortBy(t => articles.indexWhere(_ == t.id))}
                sorted
              }
            }

            val contentApiQuery = (parse(r.body) \ "contentApiQuery").asOpt[String] map { query =>
              val queryParams: Map[String, String] = QueryParams.get(query).mapValues{_.mkString("")}
              val queryParamsWithEdition = queryParams + ("edition" -> queryParams.getOrElse("edition", Edition.defaultEdition.id))
              val search = ContentApi.search(edition)
              val queryParamsAsStringParams = queryParamsWithEdition map {case (k, v) => k -> search.StringParameter(k, Some(v))}
              val newSearch = search.withParameters(search.parameterHolder ++ queryParamsAsStringParams).showFields("all")

              newSearch.response map { r =>
                r.results.map(Content(_))
              }
            } getOrElse Future(Nil)

            val results = for {
              idSearchResults <- idSearch
              contentApiResults <- contentApiQuery
            } yield idSearchResults ++ contentApiResults

            results map {
              case l: List[Content] => Some(CustomTrailblockDescription(id, name, numItemsVisible, style, isConfigured) {
                results
              })
            } fallbackTo Future(None)

          case _ =>
            log.warn(s"Could not load running order: ${r.status} ${r.statusText}")
            // NOTE: better way of handling fallback
            Future(Some(ItemTrailblockDescription(id, name, numItemsVisible, style, showMore, isConfigured)(edition)))
        }
    }
  }

}

object RunningOrderTrailblockDescription {
  def apply(id: String, blockId: String, name: String, numItemsVisible: Int, style: Option[Style] = None, showMore: Boolean = false, isConfigured: Boolean = false)(implicit edition: Edition) =
    new RunningOrderTrailblockDescription(id, blockId, name, numItemsVisible, style, showMore, edition, isConfigured)
}
