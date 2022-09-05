package views.support

import java.text.DecimalFormat

import common._
import model.Cached.WithoutRevalidationResult
import model._
import model.pressed.PressedContent
import org.apache.commons.lang.StringEscapeUtils
import org.joda.time.format.DateTimeFormat
import org.joda.time.{DateTime, DateTimeZone, LocalDate}
import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import org.jsoup.safety.{Cleaner, Whitelist}
import play.api.libs.json.Json._
import play.api.libs.json.Writes
import play.api.mvc.{RequestHeader, Result}
import play.twirl.api.Html
import layout.slices.ContainerDefinition

import scala.jdk.CollectionConverters._

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
    case 1           => s"first ${_rowClass}"
    case _ if isLast => s"last ${_rowClass}"
    case _           => _rowClass
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

  /*
    The removeDuplicateNames was introduced to correct a bug in the original workings of the apply's fold, by which
    The presence of more than one tag with a given name ( `tag.name` ) would result in nested HTML markups.

    This was never noticed before because the anchor at the most inner position of the nesting wold be displayed correctly.

    Original output of the fold:

      <span itemscope="" itemtype="http://schema.org/Person" itemprop="author">
          <a rel="author" class="tone-colour" itemprop="sameAs" data-link-name="auto tag link" href="http://localhost:9000/profile/scottbryan">
              <span itemprop="name">
                  <span itemscope="" itemtype="http://schema.org/Person" itemprop="author">
                      <a rel="author" class="tone-colour" itemprop="sameAs" data-link-name="auto tag link" href="http://localhost:9000/profile/scott-bryan">
                          <span itemprop="name">
                              <span itemscope="" itemtype="http://schema.org/Person" itemprop="author">
                                  <a rel="author" class="tone-colour" itemprop="sameAs" data-link-name="auto tag link" href="http://localhost:9000/profile/scottbryan">
                                      <span itemprop="name">Scott Bryan</span>
                                  </a>
                              </span>
                          </span>
                      </a>
                  </span>
              </span>
           </a>
       </span>

       and

       <span itemscope="" itemtype="http://schema.org/Person" itemprop="author">
           <a rel="author" class="tone-colour" itemprop="sameAs" data-link-name="auto tag link" href="http://localhost:9000/profile/michael-chakraverty">
               <span itemprop="name">Michael Chakraverty</span>
           </a>
       </span>

    Updated/Corrected output of the fold:

       <span itemscope="" itemtype="http://schema.org/Person" itemprop="author">
           <a rel="author" class="tone-colour" itemprop="sameAs" data-link-name="auto tag link" href="http://localhost:9000/profile/scottbryan">
               <span itemprop="name">Scott Bryan</span>
           </a>
       </span>

       and

       <span itemscope="" itemtype="http://schema.org/Person" itemprop="author">
          <a rel="author" class="tone-colour" itemprop="sameAs" data-link-name="auto tag link" href="http://localhost:9000/profile/michael-chakraverty">
              <span itemprop="name">Michael Chakraverty</span>
          </a>
       </span>
   */
  def removeDuplicateNames(tags: Seq[Tag]): Seq[Tag] = tags.groupBy(_.name).map(_._2.head).toSeq

  def apply(text: String, tags: Seq[Tag])(implicit request: RequestHeader): Html = {
    Html {
      removeDuplicateNames(tags).foldLeft(text) {
        case (t, tag) =>
          t.replaceFirst(
            tag.name,
            s"""<span itemscope="" itemtype="http://schema.org/Person" itemprop="author">
             |  <a rel="author" class="tone-colour" itemprop="sameAs" data-link-name="auto tag link"
             |    href="${LinkTo("/" + tag.id)}"><span itemprop="name">${tag.name}</span></a></span>""".stripMargin,
          )
      }
    }
  }

  def apply(html: Html, tags: Seq[Tag])(implicit request: RequestHeader): Html = apply(html.body, tags)
}

object `package` {

  def withJsoup(html: Html)(cleaners: HtmlCleaner*): Html = withJsoup(html.body)(cleaners: _*)

  def withJsoup(html: String)(cleaners: HtmlCleaner*): Html = {
    val cleanedHtml = cleaners.foldLeft(Jsoup.parseBodyFragment(html)) { case (html, cleaner) => cleaner.clean(html) }
    Html(cleanedHtml.body.html)
  }

  def getTagContainerDefinition(page: ContentPage): ContainerDefinition = {
    if (page.item.tags.isContributorPage) {
      layout.slices.TagContainers.contributorTagPage
    } else if (page.item.tags.keywords.nonEmpty) {
      layout.slices.TagContainers.keywordPage
    } else {
      layout.slices.TagContainers.tagPage
    }
  }

  implicit class Tags2tagUtils(t: Tags) {
    def typeOrTone: Option[Tag] = t.types.find(_.id != "type/article").orElse(t.tones.headOption)
  }

  implicit class Seq2zipWithRowInfo[A](seq: Seq[A]) {
    def zipWithRowInfo: Seq[(A, RowInfo)] =
      seq.zipWithIndex.map {
        case (item, index) => (item, RowInfo(index + 1, seq.length == index + 1))
      }
  }
}

object GuDateFormatLegacy {

  def apply(date: DateTime, pattern: String, tzOverride: Option[DateTimeZone] = None)(implicit
      request: RequestHeader,
  ): String = {
    apply(date, Edition(request), pattern, tzOverride)
  }

  def apply(date: DateTime, edition: Edition, pattern: String, tzOverride: Option[DateTimeZone]): String = {
    val timeZone = tzOverride match {
      case Some(tz) => tz
      case _        => edition.timezone
    }
    date.toString(DateTimeFormat.forPattern(pattern).withZone(timeZone))
  }

  def apply(date: LocalDate, pattern: String)(implicit request: RequestHeader): String =
    this(date.toDateTimeAtStartOfDay, pattern)(request)

  def apply(a: Int): String = new DecimalFormat("#,###").format(a)
}

object cleanTrailText {
  def apply(text: String)(implicit edition: Edition, request: RequestHeader): Html = {
    withJsoup(RemoveOuterParaHtml(BulletCleaner(text)))(InBodyLinkCleaner("in trail text link"))
  }
}

object StripHtmlTags {
  def apply(html: String): String = Jsoup.clean(html, "", Whitelist.none())
}

object StripHtmlTagsAndUnescapeEntities {
  def apply(html: String): String = {
    val doc = new Cleaner(Whitelist.none()).clean(Jsoup.parse(html))
    val stripped = doc.body.html
    val unescaped = StringEscapeUtils.unescapeHtml(stripped)
    unescaped.replace("\"", "&#34;") //double quotes will break HTML attributes
  }
}

object TableEmbedComplimentaryToP extends HtmlCleaner {
  override def clean(document: Document): Document = {
    document.getElementsByClass("element-table").asScala.foreach { element =>
      Option(element.nextElementSibling).map { nextSibling =>
        if (nextSibling.tagName == "p") element.addClass("element-table--complimentary")
      }
    }
    document
  }
}

object RenderOtherStatus {
  def gonePage(implicit request: RequestHeader): SimplePage = {
    val canonicalUrl: Option[String] = Some(s"/${request.path.drop(1).split("/").head}")
    SimplePage(
      MetaData.make(
        id = request.path,
        section = Some(SectionId.fromId("news")),
        webTitle = "This page has been removed",
        canonicalUrl,
        contentType = Some(model.DotcomContentType.Unknown),
      ),
    )
  }

  def apply(result: Result)(implicit request: RequestHeader, context: ApplicationContext): Result =
    result.header.status match {
      case 404                   => NoCache(NotFound)
      case 410 if request.isJson => Cached(60)(JsonComponent(gonePage, "status" -> "GONE"))
      case 410 =>
        Cached(60)(
          WithoutRevalidationResult(
            Gone(
              views.html.gone(
                gonePage,
                "Sorry - this page has been removed.",
                "This could be, for example, because content associated with it is not yet published, or due to legal reasons such as the expiry of our rights to publish the content.",
              ),
            ),
          ),
        )
      case _ => result
    }
}

object RenderClasses {
  def apply(classes: Map[String, Boolean], extraClasses: String*): String =
    apply((classes.filter(_._2).keys ++ extraClasses).toSeq: _*)

  def apply(classes: String*): String = classes.filter(_.nonEmpty).sorted.distinct.mkString(" ")
}

object SnapData {
  def apply(faciaContent: PressedContent): String = generateDataAttributes(faciaContent).mkString(" ")

  private def generateDataAttributes(faciaContent: PressedContent): Iterable[String] =
    faciaContent.properties.embedType.filter(_.nonEmpty).map(t => s"data-snap-type=$t") ++
      faciaContent.properties.embedUri.filter(_.nonEmpty).map(t => s"data-snap-uri=$t")
}
