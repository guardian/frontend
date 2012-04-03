package content

import com.gu.openplatform.contentapi.model.{ Content => ApiContent }
import com.gu.openplatform.contentapi.model.{ Tag => ApiTag }
import com.gu.openplatform.contentapi.model.{ MediaAsset => ApiMedia }
import conf.Logging
import org.joda.time.DateTime

case class Tag(private val tag: ApiTag) {
  lazy val url: String = tag.webUrl
  lazy val name: String = tag.webTitle
  lazy val tagType: String = tag.`type`
  lazy val id: String = tag.id
}

case class Image(private val media: ApiMedia) {
  private val fields = media.fields.getOrElse(Map.empty[String, String])

  lazy val mediaType: String = media.`type`
  lazy val rel: String = media.rel
  lazy val url: Option[String] = media.file
  lazy val caption: Option[String] = fields.get("caption")
  lazy val width: Int = fields.get("width").map(_.toInt).getOrElse(0)
}

case class Article(private val content: ApiContent) {
  lazy val id: String = content.id
  lazy val headline: String = content.safeFields("headline")
  lazy val body: String = content.safeFields("body")
  lazy val tags: Seq[Tag] = content.tags map { Tag(_) }
  lazy val images: Seq[Image] = content.mediaAssets.filter{ _.`type` == "picture" } map { Image(_) }
  lazy val section: String = content.sectionName getOrElse ""
  lazy val publication: String = content.safeFields("publication")
  def tagsOfType(tagType: String): Seq[Tag] = tags filter { _.tagType == tagType }
  lazy val webPublicationDate: DateTime = content.webPublicationDate
  lazy val trailText: Option[String] = content.safeFields.get("trailText")
  lazy val apiUrl: String = content.apiUrl
  lazy val shortUrl: String = content.safeFields("shortUrl")
}

object Article extends Logging {
  import conf._

  def byId(path: String): Option[Article] = suppressApi404 {
    log.info("Fetching article: " + path)
    ContentApi.item
      .showTags("all")
      .showFields("all")
      .showMedia("all")
      .itemId(path)
      .response
      .content.filter { _.isArticle } map { Article(_) }
  }
}
