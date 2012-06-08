package common

import com.gu.openplatform.contentapi.model.{ Content => ApiContent, Tag => ApiTag, Section => ApiSection }
import java.net.URLEncoder.encode
import play.api.templates.Html
import play.api.mvc.{ Headers, RequestHeader }

// NEVER FORGET - Just calling this SupportedUrl doesn't make it not UrlBuilder, y'know.
object SupportedUrl {
  def apply(c: ApiContent): String = if (isSupportedInApp(c)) "/%s" format c.id else c.webUrl
  def apply(t: ApiTag): String = "/%s" format t.id
  def apply(s: ApiSection): String = "/%s" format s.id

  private def isSupportedInApp(c: ApiContent) = c.isArticle || c.isGallery
}

object Edition extends Logging {
  def apply(request: RequestHeader, config: Configuration) = {
    val host = request.headers.get("X-GU-OriginalServer").orElse(request.headers.get("host"))
    val edition = config.edition(host)
    log.trace("Edition resolved %s -> %s" format (host.getOrElse("UNKNOWN"), edition))
    edition
  }
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

object TagLinks {
  def apply(text: String, tags: Seq[Tag]): Html = Html {
    tags.foldLeft(text) {
      case (t, tag) =>
        t.replaceFirst(tag.name, <a data-link-name="auto tag link" href={ "/" + tag.id }>{ tag.name }</a>.toString)
    }
  }
  def apply(html: Html, tags: Seq[Tag]): Html = apply(html.text, tags)
}
