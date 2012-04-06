package content

import conf.Logging
import com.gu.openplatform.contentapi.model.{ItemResponse, Content => ApiContent, Tag => ApiTag, MediaAsset => ApiMedia}

case class Tag(private val tag: ApiTag) {
  lazy val url: String = RelativeUrl(tag)
  lazy val name: String = tag.webTitle
}

case class ContentTrail(content: ApiContent) {
  lazy val url: String = RelativeUrl(content)
  lazy val linkText: String = content.webTitle
}

case class Image(private val media: ApiMedia) {
  private val fields = media.fields.getOrElse(Map.empty[String, String])

  lazy val mediaType: String = media.`type`
  lazy val rel: String = media.rel
  lazy val url: Option[String] = media.file
  lazy val caption: Option[String] = fields.get("caption")
  lazy val width: Int = fields.get("width").map(_.toInt).getOrElse(0)
}

case class Article(private val content: ApiContent, relatedContent: Seq[ContentTrail] = Nil) {
  lazy val headline: String = content.safeFields("headline")
  lazy val body: String = content.safeFields("body")
  lazy val tags: Seq[Tag] = content.tags map { Tag(_) }
  lazy val images: Seq[Image] = content.mediaAssets.filter{ _.`type` == "picture" } map { Image(_) }
}

object Article extends Logging {
  import conf._

  def byId(path: String): Option[Article] = suppressApi404 {
    log.info("Fetching article: " + path)
    val response: ItemResponse = ContentApi.item
      .showTags("all")
      .showFields("all")
      .showMedia("all")
      .showRelated(true)
      .itemId(path)
      .response
    val related = response.relatedContent map  { ContentTrail(_) }
    response.content.filter { _.isArticle } map { Article(_, related) }
  }
}
