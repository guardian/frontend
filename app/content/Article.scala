package content

import com.gu.openplatform.contentapi.model.{ Content => ApiContent }
import com.gu.openplatform.contentapi.model.{ Tag => ApiTag }
import conf.Logging

class Tag(private val tag: ApiTag) {
  lazy val url: String = tag.webUrl
  lazy val name: String = tag.webTitle
}

class Article(private val content: ApiContent) {
  lazy val headline: String = content.safeFields("headline")
  lazy val body: String = content.safeFields("body")
  lazy val tags: Seq[Tag] = content.tags map { new Tag(_) }
}

object Article extends Logging {
  import conf._

  def byId(path: String): Option[Article] = suppressApi404 {
    log.info("Fetching article: " + path)
    ContentApi.item
      .showTags("all")
      .showFields("all")
      .itemId(path)
      .response
      .content.filter { _.isArticle } map { new Article(_) }
  }
}
