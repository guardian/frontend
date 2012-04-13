package content

import com.gu.openplatform.contentapi.model.{ItemResponse, Content => ApiContent}
import frontend.common._
import conf._

case class Article(private val content: ApiContent, private val related: Seq[Trail] = Nil)
  extends Content(content, related)  {

  lazy val body: String = content.safeFields("body")

  override lazy val metaData = super.metaData + ("content-type" -> "Article")
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
