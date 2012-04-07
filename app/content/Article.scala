package content

import conf.Logging
import com.gu.openplatform.contentapi.model.{ItemResponse, Content => ApiContent}
import frontend.common.{Image, Trail, Tag}

case class Article(private val content: ApiContent, relatedContent: Seq[Trail] = Nil) {
  lazy val headline: String = content.safeFields("headline")
  lazy val body: String = content.safeFields("body")
  lazy val tags: Seq[Tag] = content.tags map { Tag(_) }
  lazy val images: Seq[Image] = content.mediaAssets.filter{ _.`type` == "picture" } map { Image(_) }
}

object Article extends Logging {

  def byId(path: String): Option[Article] = suppressApi404 {
    log.info("Fetching article: " + path)
    val response: ItemResponse = ContentApi.item
      .showTags("all")
      .showFields("all")
      .showMedia("all")
      .showRelated(true)
      .itemId(path)
      .response
    val related = response.relatedContent map  { Trail(_) }
    response.content.filter { _.isArticle } map { Article(_, related) }
  }
}
