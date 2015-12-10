package views.support

import com.gu.facia.api.models.{LinkSnap, FaciaContent}
import common._
import model._
import model.pressed.PressedContent

import org.apache.commons.lang.StringEscapeUtils
import org.joda.time.{DateTimeZone, LocalDate, DateTime}
import org.joda.time.format.DateTimeFormat
import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import org.jsoup.safety.{ Whitelist, Cleaner }
import play.api.libs.json.Json._
import play.api.libs.json.Writes
import play.api.mvc.RequestHeader
import play.api.mvc.Result
import play.twirl.api.Html
import scala.collection.JavaConversions._
import java.text.DecimalFormat

/**
 * Encapsulates previous and next urls
 */
case class PreviousAndNext(prev: Option[String], next: Option[String]) {
  val isDefined: Boolean = prev.isDefined || next.isDefined
}

object JSON {
  //we wrap the result in an Html so that play does not escape it as html
  //after we have gone to the trouble of escaping it as Javascript
  def apply[T](json: T)(implicit tjs: Writes[T]): Html = Html(stringify(toJson(json)))
}

//annoyingly content api will sometimes have things surrounded by <p> tags and sometimes not.
//since you cannot nest <p> tags this causes all sorts of problems
object RemoveOuterParaHtml {
  def apply(html: Html): Html = this(html.body)

  def apply(text: String): Html = {
    val fragment = Jsoup.parseBodyFragment(text).body()
    if (!fragment.html().startsWith("<p>")) {
      Html(text)
    } else {
      Html(fragment.html.drop(3).dropRight(4))
    }
  }
}

case class RowInfo(rowNum: Int, isLast: Boolean = false) {
  lazy val isFirst = rowNum == 1
  lazy val isEven = rowNum % 2 == 0
  lazy val isOdd = !isEven
  lazy val rowClass = rowNum match {
    case 1 => s"first ${_rowClass}"
    case _ if isLast => s"last ${_rowClass}"
    case _ => _rowClass
  }
  private lazy val _rowClass = if (isEven) "even" else "odd"

  def indexIsInSameCarousel(carouselWidth: Int, candidate: Int): Boolean = {
    val tolerance = (carouselWidth - 1) / 2 // Your problem if carouselWidth % 2 == 0
    val carousel = (rowNum - tolerance) to (rowNum + tolerance)
    carousel contains candidate
  }
}

// whitespace in the <span> below is significant
// (results in spaces after author names before commas)
// so don't add any, fool.
object ContributorLinks {
  def apply(text: String, tags: Seq[Tag])(implicit request: RequestHeader): Html = Html {
    tags.foldLeft(text) {
      case (t, tag) =>
        t.replaceFirst(tag.name,
        s"""<span itemscope="" itemtype="http://schema.org/Person" itemprop="author">
           |  <a rel="author" class="tone-colour" itemprop="sameAs" data-link-name="auto tag link"
           |    href="${LinkTo("/"+tag.id)}"><span itemprop="name">${tag.name}</span></a></span>""".stripMargin)
    }
  }
  def apply(html: Html, tags: Seq[Tag])(implicit request: RequestHeader): Html = apply(html.body, tags)
}

object `package` extends Formats {

  def withJsoup(html: Html)(cleaners: HtmlCleaner*): Html = withJsoup(html.body) { cleaners: _* }

  def withJsoup(html: String)(cleaners: HtmlCleaner*): Html = {
    val cleanedHtml = cleaners.foldLeft(Jsoup.parseBodyFragment(html)) { case (html, cleaner) => cleaner.clean(html) }
    Html(cleanedHtml.body.html)
  }

  def getTagContainerDefinition(page: ContentPage) = {
    if (page.item.tags.isContributorPage) {
      slices.TagContainers.contributorTagPage
    } else if (page.item.tags.keywords.nonEmpty) {
      slices.TagContainers.keywordPage
    } else {
      slices.TagContainers.tagPage
    }
  }

  implicit class Tags2tagUtils(t: Tags) {
    def typeOrTone: Option[Tag] = t.types.find(_.id != "type/article").orElse(t.tones.headOption)
  }

  implicit class Seq2zipWithRowInfo[A](seq: Seq[A]) {
    def zipWithRowInfo = seq.zipWithIndex.map {
      case (item, index) => (item, RowInfo(index + 1, seq.length == index + 1))
    }
  }
}

object AuFriendlyFormat {
  def apply(date: DateTime)(implicit request: RequestHeader): String = {
    val edition = Edition(request)
    val timezone = edition.timezone

    edition.id match {
      case "AU" => date.toString(DateTimeFormat.forPattern("HH.mm").withZone(timezone)) + " " + timezone.getShortName(date.getMillis)
      case _ => date.toString(DateTimeFormat.forPattern("HH.mm z").withZone(timezone))
    }
  }
}

object Format {
  def apply(date: DateTime, pattern: String, tzOverride: Option[DateTimeZone] = None)(implicit request: RequestHeader): String = {
    apply(date, Edition(request), pattern, tzOverride)
  }

  def apply(date: DateTime, edition: Edition, pattern: String, tzOverride: Option[DateTimeZone]): String = {
    val timeZone = tzOverride match {
      case Some(tz) => tz
      case _ => edition.timezone
    }
    date.toString(DateTimeFormat.forPattern(pattern).withZone(timeZone))
  }

  def apply(date: LocalDate, pattern: String)(implicit request: RequestHeader): String = this(date.toDateTimeAtStartOfDay, pattern)(request)

  def apply(a: Int): String = new DecimalFormat("#,###").format(a)
}

object cleanTrailText {
  def apply(text: String)(implicit edition: Edition, request: RequestHeader): Html = {
    withJsoup(RemoveOuterParaHtml(BulletCleaner(text)))(InBodyLinkCleaner("in trail text link"))
  }
}

object StripHtmlTags {
  def apply(html: String): String = Jsoup.clean(html, Whitelist.none())
}

object StripHtmlTagsAndUnescapeEntities{
  def apply(html: String) : String = {
    val doc = new Cleaner(Whitelist.none()).clean(Jsoup.parse(html))
    val stripped = doc.body.html
    val unescaped = StringEscapeUtils.unescapeHtml(stripped)
    unescaped.replace("\"","&#34;")   //double quotes will break HTML attributes
  }
}

object TableEmbedComplimentaryToP extends HtmlCleaner {
  override def clean(document: Document): Document = {
    document.getElementsByClass("element-table").foreach { element =>
      Option(element.nextElementSibling).map { nextSibling =>
        if (nextSibling.tagName == "p") element.addClass("element-table--complimentary")
      }
    }
    document
  }
}

object RenderOtherStatus {
  def gonePage(implicit request: RequestHeader) = {
    val canonicalUrl: Option[String] = Some(s"/${request.path.drop(1).split("/").head}")
    SimplePage(MetaData.make(request.path, "news", "This page has been removed", "GFE:Gone", canonicalUrl = canonicalUrl))
  }

  def apply(result: Result)(implicit request: RequestHeader) = result.header.status match {
    case 404 => NoCache(NotFound)
    case 410 if request.isJson => Cached(60)(JsonComponent(gonePage, "status" -> "GONE"))
    case 410 => Cached(60)(Ok(views.html.expired(gonePage)))
    case _ => result
  }
}

object RenderClasses {
  def apply(classes: Map[String, Boolean], extraClasses: String*): String =
    apply((classes.filter(_._2).keys ++ extraClasses).toSeq:_*)

  def apply(classes: String*): String = classes.filter(_.nonEmpty).sorted.distinct.mkString(" ")
}

object SnapData {
  def apply(faciaContent: PressedContent): String = generateDataAttributes(faciaContent).mkString(" ")

  private def generateDataAttributes(faciaContent: PressedContent): Iterable[String] =
    faciaContent.properties.embedType.filter(_.nonEmpty).map(t => s"data-snap-type=$t") ++
    faciaContent.properties.embedUri.filter(_.nonEmpty).map(t => s"data-snap-uri=$t")
}
