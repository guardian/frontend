package common

import com.gu.openplatform.contentapi.model.{ Content => ApiContent, Tag => ApiTag, Section => ApiSection }
import play.api.mvc.Request
import java.net.URLEncoder.encode
import play.api.templates.Html

// NEVER FORGET - Just calling this SupportedUrl doesn't make it not UrlBuilder, y'know.
object SupportedUrl {
  def apply(c: ApiContent): String = if (isSupportedInApp(c)) "/%s" format c.id else c.webUrl
  def apply(t: ApiTag): String = "/%s" format t.id
  def apply(s: ApiSection): String = "/%s" format s.id

  private def isSupportedInApp(c: ApiContent) = c.isArticle || c.isGallery
}

object OriginDomain {
  def apply[A](request: Request[A]): Option[String] = request.headers.get("X-GU-OriginalServer")
}

object OmnitureAnalyticsData {
  def apply(page: MetaData): Html = {

    val data = page.metaData.map { case (key, value) => key -> value.toString }
    val pageCode = data.get("page-code").getOrElse("")
    val contentType = data.get("content-type").getOrElse("")
    val section = data.get("section").getOrElse("")

    val analyticsData = Map(
      "pageName" -> (data("web-title").take(72) + (":%s:%s" format (contentType, pageCode))),
      "ch" -> section,
      "c9" -> section,
      "c4" -> data.get("keywords").getOrElse(""),
      "c6" -> data.get("author").getOrElse(""),
      "c8" -> pageCode,
      "c10" -> data.get("tones").getOrElse(""),
      "c11" -> section,
      "c13" -> data.get("series").getOrElse(""),
      "c25" -> data.get("blogs").getOrElse(""),
      "c14" -> data("build-number")
    )

    Html(analyticsData map { case (key, value) => key + "=" + encode(value, "UTF-8") } mkString ("&"))
  }
}

object InBodyUrl extends Logging {

  //all content types except article (they do not have the word "article" in the url)
  private val supportedContentTypes = Seq("gallery")
  private val unSupportedContentTypes = Seq("video", "audio", "interactive", "poll", "quiz", "picture", "sudoku",
    "crossword", "competition", "podcast", "signup", "cartoon", "table", "graphic", "audioslideshow", "data",
    "document")

  private val domain = """http://www.(guardian.co.uk|guardiannews.com)"""
  private val section = """(/[\w\d-]+)"""
  private val blog = section
  private val date = """(/\d\d\d\d/\w\w\w/\d\d)"""
  private val contentType = section
  private val wordsForUrl = section

  private val SectionUrl = (domain + section).r
  private val TagUrl = (domain + section + wordsForUrl).r
  private val BlogUrl = (domain + section + blog + wordsForUrl).r //also newspaper book sections e.t.c.

  private val ContentUrl = (domain + section + contentType + date + wordsForUrl).r
  private val BlogContentUrl = (domain + section + blog + contentType + date + wordsForUrl).r

  private val ArticleUrl = (domain + section + date + wordsForUrl).r
  private val ArticleBlogUrl = (domain + section + blog + date + wordsForUrl).r

  private object Supported {
    def unapply(s: String): Option[String] = if (supportedContentTypes.exists(_ == s.drop(1))) Some(s) else None
  }

  private object UnSupported {
    def unapply(s: String): Option[String] = if (unSupportedContentTypes.exists(_ == s.drop(1))) Some(s) else None
  }

  // see http://www.scala-lang.org/node/7290
  // partial functions with Regex grow exponentially and the JVM has a max size for a method
  def apply(url: String): String = pageTypes(url).orElse(contentTypes(url)).orElse(unknownUrl(url))(url)

  private def unknownUrl(url: String): PartialFunction[String, String] = {
    case unknown =>
      log.debug("unsupported: did not understand url %s" format (unknown))
      unknown
  }

  private def pageTypes(url: String): PartialFunction[String, String] = {
    case SectionUrl(_, section) =>
      log.debug("supported: resolved %s as a section" format (url))
      section

    case TagUrl(_, section, wordsForUrl) =>
      log.debug("supported: resolved %s as a tag" format (url))
      section + wordsForUrl

    case BlogUrl(_, section, blog, wordsForUrl) =>
      log.debug("supported: resolved %s as a blog tag" format (url))
      section + blog + wordsForUrl
  }

  private def contentTypes(url: String): PartialFunction[String, String] = {
    case ContentUrl(_, section, Supported(contentType), date, wordsForUrl) =>
      log.debug("supported: resolved %s as a %s" format (url, contentType))
      section + contentType + date + wordsForUrl

    case BlogContentUrl(_, section, blog, Supported(contentType), date, wordsForUrl) =>
      log.debug("supported: resolved %s as a %s blog" format (url, contentType))
      section + blog + contentType + date + wordsForUrl

    case ContentUrl(_, _, UnSupported(contentType), _, _) =>
      log.debug("unsupported: resolved %s as a %s" format (url, contentType))
      url

    case BlogContentUrl(_, _, _, UnSupported(contentType), _, _) =>
      log.debug("unsupported: resolved %s as a %s blog" format (url, contentType))
      url

    case ArticleUrl(_, section, date, wordsForUrl) =>
      log.debug("supported: resolved %s as an /article" format (url))
      section + date + wordsForUrl

    case ArticleBlogUrl(_, section, blog, date, wordsForUrl) =>
      log.debug("supported: resolved %s as an /article blog" format (url))
      section + blog + date + wordsForUrl
  }

}

object TagLinks {
  def apply(text: String, tags: Seq[Tag]): Html = Html {
    tags.foldLeft(text) {
      case (t, tag) =>
        t.replaceFirst(tag.name, <a data-link-name="auto tag link" href={ "/" + tag.id }>{ tag.name }</a>.toString)
    }
  }
  def apply(html: Html, tags: Seq[Tag]): Html = apply(html.text, tags)
}
