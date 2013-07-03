package model

import org.joda.time.DateTime
import views.support.Style
import scala.math
import scala.concurrent.Future
import conf.{Configuration, ContentApi}
import common.{Logging, AkkaSupport, ExecutionContexts, Edition}
import contentapi.QueryDefaults
import play.api.libs.ws.WS
import play.api.libs.json.Json._

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



trait TrailblockNew {
  val id: String
  val name: String
  val edition: Edition

  def trails: Seq[Trail]
  def refresh
  def close
}

/**
 * Trailblock defined from the fronts api
 *
 * @param id
 * @param name
 * @param edition
 */
class RunningOrderTrailblock(
                              val id: String,
                              val name: String,
                              val edition: Edition) extends TrailblockNew with AkkaSupport with Logging
{

  private lazy val agent = play_akka.agent[Seq[Trail]](Nil)

  def trails: Seq[Trail] = agent()

  def refresh = {
    // get the running order from the api
    WS.url(s"${Configuration.frontsApi.host}/frontsapi/list/$id").get() foreach { response =>
      response.status match {
        case 200 =>
          val articles = (parse(response.body) \ id).asOpt[List[String]].getOrElse(Nil)
          retrieveArticles(articles)
        case _ => log.warn(s"Could not load running order: ${response.status} ${response.statusText}")
      }
    }
  }

  private def retrieveArticles(articles: Seq[String]) = {
    ContentApi.search(edition)
      .ids(articles.mkString(","))
      .response map { r =>
      agent.send{ old =>
        r.results.map(new Content(_))
      }
    }
  }

  def close = agent.close()

}

object RunningOrderTrailblock {

  def apply(id: String, name: String)(implicit edition: Edition) = new RunningOrderTrailblock(id, name, edition)

}