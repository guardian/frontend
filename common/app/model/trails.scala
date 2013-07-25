package model

import org.joda.time.DateTime
import views.support.Style
import scala.math
import scala.concurrent.Future
import conf.{Configuration, ContentApi}
import common.{Logging, AkkaSupport, ExecutionContexts, Edition}
import contentapi.QueryDefaults
import play.api.libs.ws.{WS, Response}
import play.api.libs.json.Json._
import play.api.libs.json.{JsObject, JsValue}
import scala.Some

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
  def storyItems: Option[StoryItems] = None

  def discussionId: Option[String] = None


  // This is a hack. We need to move this somewhere better.
  def importance = storyItems.map(_.importance).getOrElse(0)
  def colour = storyItems.map(_.colour).getOrElse(0)
  def quote = storyItems.flatMap(_.quote)
  def headlineOverride = storyItems.flatMap(_.headlineOverride).getOrElse(headline)
  def shares = storyItems.flatMap(_.shares).getOrElse(0)
  def comments = storyItems.flatMap(_.comments).getOrElse(0)

  // Decayed performance, calculated as: ( shares + comments/2 ) / Days^1.5 (with days minimum = 1)
  lazy val performance = if (shares > 0 || comments > 0) (shares + comments / 2) / math.pow(math.max(1, ((new DateTime).getMillis - webPublicationDate.getMillis) / 86400000), 1.5).toFloat else 0
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
    val configUrl = s"${Configuration.frontsApi.base}/${edition.id.toLowerCase}/$section/$blockId/latest/latest.json"
    log.info(s"loading running order configuration from: $configUrl")
    parseResponse(WS.url(s"$configUrl").withTimeout(2000).get())
  }

  private def parseResponse(response: Future[Response]) = {
    response.map{ r =>
      r.status match {
        case 200 =>
          // extract the articles
          val articles: Seq[String] = (parse(r.body) \ "trails").as[Seq[JsObject]] map { trail =>
            (trail \ "id").as[String]
          }
          // only make content api request if we have articles
          if (articles.nonEmpty)
            Some(CustomTrailblockDescription(id, name, numItemsVisible){
              ContentApi.search(edition)
                .ids(articles.mkString(","))
                .response map { r =>
                  r.results.map(new Content(_)).sortBy(t => articles.indexWhere(_.equals(t.id)))
                }
            })
          else
            None
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

class FeatureTrailblockDescription(
  val id: String,
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
    val configUrl = Configuration.front.config
    log.info(s"loading front configuration from: $configUrl")
    // need to use AWS tool, otherwise
    parseResponse(WS.url(configUrl).withTimeout(2000).get())
  }

  private def parseResponse(response: Future[Response]) = {
    response.map{ r =>
      r.status match {
        case 200 =>
          (parse(r.body) \ (edition.id.toLowerCase) \ "blocks").asOpt[Seq[JsValue]] map(_.headOption) getOrElse(None) map { block =>
            ItemTrailblockDescription(
              toId((block \ "id").as[String]),
              (block \ "title").as[String],
              (block \ "numItems").as[Int],
              showMore = (block \ "showMore").asOpt[Boolean].getOrElse(false),
              isConfigured = true
            )(edition)
          }
        case _ =>
          log.warn(s"Could not load front configuration: ${r.status} ${r.statusText}")
          None
      }
    }
  }

  private def toId(id: String) = id.split("/").toSeq match {
    case Seq(start, end) if start == end => start // this is a sections tag e.g. politics/politics
    case _ => id
  }

}

object FeatureTrailblockDescription {
  def apply(id: String, name: String, numItemsVisible: Int, style: Option[Style] = None, showMore: Boolean = false, isConfigured: Boolean = false)(implicit edition: Edition) =
    new FeatureTrailblockDescription(id, name, numItemsVisible, style, showMore, edition, isConfigured)
}
