package controllers

import com.gu.openplatform.contentapi.model.ItemResponse
import conf._
import common._
import play.api.mvc.{ Content => Unwanted, _ }
import play.api.libs.concurrent.Promise
import com.gu.openplatform.contentapi.parser.JsonParser
import play.api.libs.ws.WS
import org.joda.time.ReadableInstant
import java.net.URLEncoder
import org.joda.time.format.ISODateTimeFormat

case class ArticlePage(article: Article, related: List[Trail], storyPackage: List[Trail])
object ArticleController extends Controller with Logging {

  def render(path: String) = Action {
    Async {
      lookup(path) map { _ map renderArticle getOrElse { NotFound } }
    }
  }

  private def lookup(path: String): Promise[Option[ArticlePage]] = {
    log.info("Fetching article: " + path)

    val query = ContentApi.item
      .showInlineElements("picture")
      .showTags("all")
      .showFields("all")
      .showMedia("all")
      .showRelated(true)
      .showStoryPackage(true)
      .itemId(path)

    val url = apiUrl(query)

    WS.url(url).get() map { wsResponse =>
      val response: ItemResponse = JsonParser.parseItem(wsResponse.body)

      val articleOption = response.content.filter { _.isArticle } map { new Article(_) }
      val related = response.relatedContent map { new Content(_) }
      val storyPackage = response.storyPackage map { new Content(_) }

      articleOption map { article => ArticlePage(article, related, storyPackage.filterNot(_.id == article.id)) }
    }
  }

  private def renderArticle(model: ArticlePage): Result =
    CachedOk(model.article) {
      views.html.article(model.article, model.related, model.storyPackage)
    }

  protected def apiUrl(query: ContentApi.ItemQuery): String = {
    val url = query._apiUrl.get
    val parameters = query.parameters + ("user-tier" -> "internal")

    require(!url.contains('?'), "must not specify parameters in url")

    def encodeParameter(p: Any): String = p match {
      case dt: ReadableInstant => URLEncoder.encode(ISODateTimeFormat.dateTimeNoMillis.print(dt), "UTF-8")
      case other => URLEncoder.encode(other.toString, "UTF-8")
    }

    val queryString = parameters.map { case (k, v) => k + "=" + encodeParameter(v) }.mkString("&")

    url + "?" + queryString
  }
}
