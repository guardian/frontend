package feed

import contentapi.ContentApiClient
import com.gu.contentapi.client.model.v1.Content
import services.{OphanApi, OphanDeeplyReadItem}
import play.api.libs.json._
import common._
import model.{MostPopular, pressed}

import scala.concurrent.{ExecutionContext, Future}

/*
  The class DeeplyReadItem is the one that define the answer to the deeply-read.json
  It is meant to be identical to a pressed.PressedContent

  example:
      {
          "url": "http://localhost:9000/politics/2020/dec/14/brexit-trade-deal-possible-within-days-after-johnson-concession-says-eu",
          "linkText": "Brexit trade deal possible within days after Johnson concession, says EU",
          "showByline": false,
          "byline": "Daniel Boffey in Brussels and Jon Henley in Paris",
          "image": "https://i.guim.co.uk/img/media/fca2a46dbd70e2b61a3aa415c2c37f78d74b0830/48_37_3201_1920/master/3201.jpg?width=300&quality=85&auto=format&fit=max&s=e59bbf08537a12c39dd93e13697c280c",
          "isLiveBlog": false,
          "pillar": "news",
          "designType": "Article",
          "webPublicationDate": "2020-12-14T17:04:28.000Z",
          "headline": "Brexit trade deal possible within days after Johnson concession, says EU",
          "shortUrl": "https://gu.com/p/fn27g"
      }

  Note that it's different from OphanDeeplyReadItem which is the one we read from the Ophan Api
 */
case class DeeplyReadItem(
    url: String,
    linkText: Option[String],
    showByline: Boolean,
    byline: Option[String],
    image: Option[String],
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

class DeeplyReadAgent(contentApiClient: ContentApiClient, ophanApi: OphanApi) extends Logging {

  /*
      This (DeeplyReadAgent) agent is similar in purpose and interface as the ones we already have at the
      time those lines re written, namely MostPopularAgent and its siblings, but there is a difference: we use a
      mutable map instead of a com.gu.Box. In either case they ( mutable map and Boxes ) are essentially used as
      key value store providing in memory caching.

      Note that as for the Box situation, this implies that several EC2 instances running this app, could be in
      slightly different states at any point in time, which is ok, as they converge at each refresh.
   */

  private val mapping: scala.collection.mutable.Map[String, Content] =
    scala.collection.mutable.Map.empty[String, Content]

  def refresh()(implicit ec: ExecutionContext): Future[Unit] = {
    /*
        Here we simply go through the OphanDeeplyReadItem we got from Ophan and for each
        query CAPI and set the Content for the path.
     */
    ophanApi.getDeeplyReadContent().map { seq =>
      seq.foreach { i =>
        val path = i.path
        log.info(s"Looking up data for path: ${path}")
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
              mapping += (path -> c) // update the Content for a given map
            }
          }
      }
    }
    Future.successful(())
  }

  def getDataForPath(path: String): Option[Content] = {
    /*
        This function returns any stored CAPI Content for a path, thereby making the link between the path read from
        a OphanDeeplyReadItem and a DeeplyReadItem (from the corresponding Content).

        we use this function instead of accessing mapping directly to abstract the logic away from the Map implementation
     */
    mapping.get(path)
  }

  def getDeeplyReadItemForOphanItem(item: OphanDeeplyReadItem): Option[DeeplyReadItem] = {
    for {
      content <- getDataForPath(item.path)
      webPublicationDate <- content.webPublicationDate
      fields <- content.fields
    } yield DeeplyReadItem(
      url = content.webUrl,
      linkText = fields.trailText,
      showByline = false,
      byline = fields.byline,
      image = fields.thumbnail,
      isLiveBlog = true,
      pillar = content.pillarName,
      designType = content.`type`.toString,
      webPublicationDate = webPublicationDate.toString(),
      headline = fields.headline,
      shortUrl = fields.shortUrl,
    )
  }

  def getReport()(implicit ec: ExecutionContext): Future[Seq[DeeplyReadItem]] = {
    ophanApi
      .getDeeplyReadContent()
      .map {
        _.map(getDeeplyReadItemForOphanItem)
          .filter(_.isDefined)
          .map(_.get) // Note that it is safe to call .get here because we have filtered on .isDefined before
      }
  }
}
