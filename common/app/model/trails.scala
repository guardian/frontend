package model

import org.joda.time.DateTime
import views.support.Style
import scala.math
import conf.ContentApi
import ContentApi.ItemQuery
import scala.concurrent.Future
import conf.ContentApi
import common.{ExecutionContexts, Edition}

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

  def query: Future[Seq[Trail]]
}

class ItemTrailblockDescription(
    val id: String, val name: String,
    val numItemsVisible: Int,
    val style: Option[Style],
    val showMore: Boolean,
    val edition: Edition,
    val isConfigured: Boolean) extends TrailblockDescription
  {
    lazy val section = id.split("/").headOption.filterNot(_ == "").getOrElse("news")

  def query: Future[Seq[Trail]] = ContentApi.item(id, edition)
    .showEditorsPicks(true)
    .pageSize(20)
    .response
    .map { response =>
    val editorsPicks = response.editorsPicks map {
      new Content(_)
    }
    val editorsPicksIds = editorsPicks map (_.id)
    val latest = response.results map {
      new Content(_)
    } filterNot (c => editorsPicksIds contains (c.id))

    editorsPicks ++ latest
  }
}

object ItemTrailblockDescription {
  def apply(id: String, name: String, numItemsVisible: Int, style: Option[Style] = None, showMore: Boolean = false, isConfigured: Boolean = false)(implicit edition: Edition) =
    new ItemTrailblockDescription(id, name, numItemsVisible, style, showMore, edition, isConfigured)
}

case class QueryTrailblockDescription(
            id: String,
            name: String,
            numItemsVisible: Int,
            style: Option[Style] = None,
            showMore: Boolean = false,
            customQuery: () => ItemQuery,
            isConfigured: Boolean = false)
    extends TrailblockDescription {

  lazy val section = id.split("/").headOption.filterNot(_ == "").getOrElse("news")

  def query: Future[Seq[Trail]] = customQuery().response.map { response =>
    val editorsPicks = response.editorsPicks map {
      new Content(_)
    }

    val results = response.results map {
      new Content(_)
    }

    editorsPicks ++ results
  }
}