package feed

import com.gu.Box
import conf.Configuration
import contentapi.ContentApiClient
import com.gu.contentapi.client.model.v1.{Content, ContentFields, ContentType}
import common._
import services.{CAPILookup, OphanApi, OphanDeeplyReadItem, OphanMostReadItem}
import model.RelatedContentItem
import play.api.libs.json._
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.{ExecutionContext, Future}

case class DeeplyReadItem(
    path: String,
    benchmarkedAttentionTime: Int,
    url: String,
    linkText: Option[String],
    showByline: Boolean,
    byline: Option[String],
    thumbnail: Option[String],
    isLiveBlog: Boolean,
    pillar: Option[String],
    designType: String,
    webPublicationDate: String,
    headline: Option[String],
    shortUrl: Option[String],
)
object DeeplyReadItem {
  implicit val jsonWrites = Json.writes[DeeplyReadItem]
}

class DeeplyReadAgent(contentApiClient: ContentApiClient, ophanApi: OphanApi) {

  private val mapping: scala.collection.mutable.Map[String, Content] =
    scala.collection.mutable.Map.empty[String, Content]

  def refresh()(implicit ec: ExecutionContext): Future[Unit] = {
    ophanApi.getDeeplyReadContent().map { seq =>
      seq.foreach { i =>
        val path = i.path
        println(s"Looking up data for path: ${path}")
        val capiItem = contentApiClient
          .item(path)
          .showTags("all")
          .showFields("all")
          .showReferences("all")
          .showAtoms("all")
        contentApiClient
          .getResponse(capiItem)
          .map { res =>
            res.content.map { c =>
              mapping += (path -> c)
            }
          }
      }
    }
    Future.successful(())
  }

  def getDataForPath(path: String): Option[Content] = {
    mapping.get(path)
  }

  def getDeeplyReadItemForOphanItem(item: OphanDeeplyReadItem): Option[DeeplyReadItem] = {
    for {
      content <- getDataForPath(item.path)
      webPublicationDate <- content.webPublicationDate
      fields <- content.fields
    } yield DeeplyReadItem(
      path = item.path,
      benchmarkedAttentionTime = item.benchmarkedAttentionTime,
      url = content.webUrl,
      linkText = fields.trailText,
      showByline = false,
      byline = fields.byline,
      thumbnail = fields.thumbnail,
      isLiveBlog = true,
      pillar = content.pillarName,
      designType = content.`type`.toString,
      webPublicationDate = webPublicationDate.toString(),
      headline = fields.headline,
      shortUrl = fields.shortUrl,
    )
  }
}
