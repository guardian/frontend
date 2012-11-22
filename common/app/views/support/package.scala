package views.support

import common._
import java.net.URLEncoder._
import model._
import org.jsoup.nodes.Document
import org.jsoup.Jsoup
import org.jboss.dna.common.text.Inflector
import play.api.libs.json.Writes
import play.api.libs.json.Json._
import play.api.templates.Html
import scala.collection.JavaConversions._

import scala.Some
import play.api.mvc.RequestHeader
import org.joda.time.{ DateTimeZone, DateTime }
import org.joda.time.format.DateTimeFormat

sealed trait Style {
  val className: String
}

object Featured extends Style { val className = "featured" }

/**
 * trails display trailText and thumbnail (if available)
 */
object Thumbnail extends Style { val className = "with-thumbnail" }

/**
 * trails only display headline
 */
object Headline extends Style { val className = "headline-only" }

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

object SafeName {
  def apply(desc: TrailblockDescription) = if (desc.id == "") "top-stories" else desc.id.replace("/", "-")
}

object JavaScriptValue {
  def apply(value: Any) = value match {
    case b: Boolean => b
    case s => "'" + s.toString.replace("'", "\\'") + "'"
  }
}

object JavaScriptVariableName {
  def apply(s: String): String = {
    val parts = s.split("-").toList
    (parts.headOption.toList ::: parts.tail.map { firstLetterUppercase }) mkString
  }
  private def firstLetterUppercase(s: String) = s.head.toUpper + s.tail
}

case class RowInfo(rowNum: Int, isLast: Boolean = false) {
  lazy val isFirst = rowNum == 1
  lazy val isEven = rowNum % 2 == 0
  lazy val isOdd = !isEven
  lazy val rowClass = rowNum match {
    case 1 => "first " + _rowClass
    case _ if isLast => "last " + _rowClass
    case _ => _rowClass
  }
  private lazy val _rowClass = if (isEven) "even" else "odd"

  def indexIsInSameCarousel(carouselWidth: Int, candidate: Int): Boolean = {
    val tolerance = (carouselWidth - 1) / 2 // Your problem if carouselWidth % 2 == 0
    val carousel = (rowNum - tolerance) to (rowNum + tolerance)
    carousel contains candidate
  }
}

trait HtmlCleaner {
  def clean(d: Document): Document
}

object BlockNumberCleaner extends HtmlCleaner {

  private val Block = """<!-- Block (\d*) -->""".r

  override def clean(document: Document): Document = {
    document.getAllElements.foreach { element =>
      val blockComments = element.childNodes.flatMap { node =>
        node.toString.trim match {
          case Block(num) =>
            Option(node.nextSibling).foreach(_.attr("id", "block-" + num))
            Some(node)
          case _ => None
        }
      }
      blockComments.foreach(_.remove())
    }
    document
  }
}

case class PictureCleaner(imageHolder: Images) extends HtmlCleaner {
  def clean(body: Document): Document = {
    body.getElementsByTag("figure").foreach { fig =>
      fig.attr("itemprop", "associatedMedia")
      fig.attr("itemscope", "")
      fig.attr("itemtype", "http://schema.org/ImageObject")

      fig.getElementsByTag("img").foreach { img =>
        img.attr("itemprop", "contentURL")
        fig.attr("class", img.attr("width").toInt match {
          case width if width <= 220 => "img-base inline-image"
          case width if width < 460 => "img-median inline-image"
          case width => "img-extended"
        })
      }

      fig.getElementsByTag("figcaption").foreach(_.attr("itemprop", "description"))
    }
    body
  }
}

object BulletCleaner {
  def apply(body: String): String = body.replace("•", """<span class="bullet">•</span>""")
}

case class InBodyLinkCleaner(dataLinkName: String) extends HtmlCleaner {
  def clean(body: Document): Document = {
    val links = body.getElementsByTag("a")

    links.foreach { link =>
      link.attr("href", InBodyLink(link.attr("href")))
      link.attr("data-link-name", dataLinkName)
    }
    body
  }
}

object TweetCleaner extends HtmlCleaner {

  override def clean(document: Document): Document = {
    document.getElementsByClass("twitter-tweet").foreach { element =>
      val el = element.clone()
      val body = el.child(0).attr("class", "tweet-body")
      val date = el.child(1).attr("class", "tweet-date")
      val user = el.ownText()
      val userEl = document.createElement("span").attr("class", "tweet-user").text(user)

      element.empty().attr("class", "tweet")
      element.appendChild(userEl).appendChild(date).appendChild(body)

    }
    document
  }
}

// beta.guardian.co.uk goes in A group
// test.guardian.co.uk goes in B group
object ABTest {
  def apply(implicit request: RequestHeader) = new {
    val isB = request.getQueryString("host").map(_ == "test").getOrElse(request.host.contains("frontend-router-prod"))
    val isA = !isB
  }
}

// whitespace in the <span> below is significant
// (results in spaces after author names before commas)
// so don't add any, fool.
object ContributorLinks {
  def apply(text: String, tags: Seq[Tag]): Html = Html {
    tags.foldLeft(text) {
      case (t, tag) =>
        t.replaceFirst(tag.name,
          <span itemscope="" itemtype="http://schema.org/Person" itemprop="author"><a rel="author" itemprop="url name" data-link-name="auto tag link" href={ "/" + tag.id }>{ tag.name }</a></span>.toString)
    }
  }
  def apply(html: Html, tags: Seq[Tag]): Html = apply(html.text, tags)
}

object OmnitureAnalyticsData {
  def apply(page: MetaData, jsSupport: String): Html = {

    val data = page.metaData.map { case (key, value) => key -> value.toString }
    val pageCode = data.get("page-code").getOrElse("")
    val contentType = data.get("content-type").getOrElse("")
    val section = data.get("section").getOrElse("")
    val platform = "frontend"
    val publication = data.get("publication").getOrElse("")

    val isContent = page match {
      case c: Content => true
      case _ => false
    }

    val pageName = page.analyticsName
    val analyticsData = Map(
      "ns" -> "guardian",
      "pageName" -> pageName,
      "v7" -> pageName,
      "c3" -> publication,
      "ch" -> section,
      "c9" -> section,
      "c4" -> data.get("keywords").getOrElse(""),
      "c6" -> data.get("author").getOrElse(""),
      "c8" -> pageCode,
      "v8" -> pageCode,
      "c9" -> contentType,
      "c10" -> data.get("tones").getOrElse(""),
      "c11" -> section,
      "c13" -> data.get("series").getOrElse(""),
      "c25" -> data.get("blogs").getOrElse(""),
      "c14" -> data("build-number"),
      "c19" -> platform,
      "v19" -> platform,
      "c30" -> (if (isContent) "content" else "non-content"),
      "c56" -> jsSupport
    )

    Html(analyticsData map { case (key, value) => key + "=" + encode(value, "UTF-8") } mkString ("&"))
  }
}

object `package` extends Formats {

  private object inflector extends Inflector

  def withJsoup(html: Html)(cleaners: HtmlCleaner*): Html = withJsoup(html.body) { cleaners: _* }

  def withJsoup(html: String)(cleaners: HtmlCleaner*): Html = {
    val cleanedHtml = cleaners.foldLeft(Jsoup.parseBodyFragment(html)) { case (html, cleaner) => cleaner.clean(html) }
    Html(cleanedHtml.body.html)
  }

  implicit def tags2tagUtils(t: Tags) = new {
    def typeOrTone: Option[Tag] = t.types.find(_.id != "type/article").orElse(t.tones.headOption)
  }

  implicit def tags2inflector(t: Tag) = new {
    lazy val singularName: String = inflector.singularize(t.name)
    lazy val pluralName: String = inflector.pluralize(t.name)
  }

  implicit def seq2zipWithRowInfo[A](seq: Seq[A]) = new {
    def zipWithRowInfo = seq.zipWithIndex.map {
      case (item, index) => (item, RowInfo(index + 1, seq.length == index + 1))
    }
  }
}

object Format {
  def apply(date: DateTime, pattern: String, edition: String = "UK"): String = {
    val timezone = edition match {
      case "US" => "America/New_York"
      case _ => "Europe/London"
    }
    date.toString(DateTimeFormat.forPattern(pattern).withZone(DateTimeZone.forID(timezone)))
  }
}

object cleanTrailText {
  def apply(text: String): Html = {
    `package`.withJsoup(RemoveOuterParaHtml(BulletCleaner(text)))(InBodyLinkCleaner("in trail text link"))
  }
}
