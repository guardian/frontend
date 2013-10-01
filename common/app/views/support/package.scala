package views.support

import common._
import java.net.URLEncoder._
import model._
import org.jsoup.nodes.{ Element, Document }
import org.jsoup.Jsoup
import org.jsoup.safety.{ Whitelist, Cleaner }
import org.jboss.dna.common.text.Inflector
import play.api.libs.json.Writes
import play.api.libs.json.Json._
import play.api.templates.Html
import scala.collection.JavaConversions._
import play.api.mvc.RequestHeader
import org.joda.time.DateTime
import org.joda.time.format.DateTimeFormat
import play.Play
import org.apache.commons.lang.StringEscapeUtils
import conf.Switches.ShowUnsupportedEmbedsSwitch

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

/**
 * trails for the section fronts
 */
object SectionFront extends Style { val className = "section-front" }

/**
 * New 'collection' templates
 */
object Masthead extends Style { val className = "masthead" }

case class SectionZone(val collectionType: String = "news") extends Style {
  val className = "section-zone"
}

case class Container(val section: String, val showMore: Boolean = false) extends Style {
  val className = "container"
}


object MetadataJson {

  def apply(data: (String, Any)): String = data match {
    // thank you erasure
    case (key, value) if value.isInstanceOf[Map[_, _]] =>
      val valueJson = value.asInstanceOf[Map[String, Any]].map(MetadataJson(_)).mkString(",")
      s""""$key": {$valueJson}"""
    case (key, value) if value.isInstanceOf[Seq[_]] =>
      val valueJson = value.asInstanceOf[Seq[(String, Any)]].map(v => s"{${MetadataJson(v)}}").mkString(",")
      s""""$key": [${valueJson}]""".format(key, valueJson)
    case (key, value) =>
      s""""${JavaScriptVariableName(key)}": ${JavaScriptValue(value)}"""
  }
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

object SafeName {
  def apply(desc: TrailblockDescription) = if (desc.id == "") "top-stories" else desc.id.replace("/", "-")
}

object JavaScriptValue {
  def apply(value: Any) = value match {
    case b: Boolean => b
    case s => s""""${s.toString.replace(""""""", """\"""")}""""
  }
}

object JavaScriptVariableName {
  def apply(s: String): String = {
    val parts = s.split("-").toList
    (parts.headOption.toList ::: parts.tail.map(firstLetterUppercase )).mkString
  }
  private def firstLetterUppercase(s: String) = s.head.toUpper + s.tail
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
            Option(node.nextSibling).foreach(_.attr("id", s"block-$num"))
            Some(node)
          case _ => None
        }
      }
      blockComments.foreach(_.remove())
    }
    document
  }
}

object VideoEmbedCleaner extends HtmlCleaner {

  override def clean(document: Document): Document = {
    document.getElementsByClass("element-video").foreach { element: Element =>
      element.child(0).wrap("<div class=\"element-video__wrap\"></div>")
    }
    document
  }
}

case class PictureCleaner(imageHolder: Elements) extends HtmlCleaner with implicits.Numbers {

  def clean(body: Document): Document = {
    body.getElementsByTag("figure").foreach { fig =>
      if(!fig.hasClass("element-comment")) {
        fig.attr("itemprop", "associatedMedia")
        fig.attr("itemscope", "")
        fig.attr("itemtype", "http://schema.org/ImageObject")

        fig.getElementsByTag("img").foreach { img =>
          img.attr("itemprop", "contentURL")
          val src = img.attr("src")
          img.attr("src", ImgSrc(src, Naked))
          Option(img.attr("width")).filter(_.isInt) foreach { width =>
            fig.addClass(width.toInt match {
              case width if width <= 220 => "img-base inline-image"
              case width if width < 460 => "img-median inline-image"
              case width => "img-extended"
            })
          }
        }
        fig.getElementsByTag("figcaption").foreach { figcaption =>
          if (!figcaption.hasText()) {
            figcaption.remove();
          } else {
            figcaption.attr("itemprop", "description")
          }
        }
      }
    }
    body
  }
}

case class VideoPosterCleaner(videos: Seq[VideoAsset]) extends HtmlCleaner {

  def clean(body: Document): Document = {
    body.getElementsByTag("video").filter(_.hasClass("gu-video")).foreach { videoTag =>
      videoTag.getElementsByTag("source").headOption.foreach{ source =>
        val file = Some(source.attr("src"))
        videos.find(_.url == file).foreach{ video =>
          video.stillImageUrl.foreach{ poster =>
            videoTag.attr("poster", poster)
          }
        }
      }
    }
    body
  }
}

object BulletCleaner {
  def apply(body: String): String = body.replace("•", """<span class="bullet">•</span>""")
}

object UnindentBulletParents extends HtmlCleaner with implicits.JSoup {
  def clean(body: Document): Document = {
    val bullets = body.getElementsByClass("bullet")
    bullets flatMap { _.parentTag("p") } foreach { _.addClass("no-indent") }
    body
  }
}

case class InBodyLinkCleaner(dataLinkName: String)(implicit val edition: Edition) extends HtmlCleaner {
  def clean(body: Document): Document = {
    val links = body.getElementsByTag("a")

    links.foreach { link =>
      link.attr("href", LinkTo(link.attr("href"), edition))
      link.attr("data-link-name", dataLinkName)
      link.addClass("tone-colour")
    }
    body
  }
}

object TweetCleaner extends HtmlCleaner {

  override def clean(document: Document): Document = {
    document.getElementsByClass("twitter-tweet").foreach { element =>
      val el = element.clone()
      if (el.children.size > 1) {
        val body = el.child(0).attr("class", "tweet-body")
        val date = el.child(1).attr("class", "tweet-date")
        val user = el.ownText()
        val userEl = document.createElement("span").attr("class", "tweet-user").text(user)

        element.empty().attr("class", "tweet")
        element.appendChild(userEl).appendChild(date).appendChild(body)
      }
    }
    document
  }
}

object InBodyElementCleaner extends HtmlCleaner {

  private val supportedElements = Seq(
    "element-tweet",
    "element-video",
    "element-image",
    "element-witness",
    "element-comment"
  )

  override def clean(document: Document): Document = {
    if (ShowUnsupportedEmbedsSwitch.isSwitchedOff) {
      // this code removes unsupported embeds
      val embeddedElements = document.getElementsByTag("figure").filter(_.hasClass("element"))
      val unsupportedElements = embeddedElements.filterNot(e => supportedElements.exists(e.hasClass(_)))
      unsupportedElements.foreach(_.remove())
    }
    document
  }
}

case class Summary(amount: Int) extends HtmlCleaner {
  override def clean(document: Document): Document = {
    val children = document.body().children().toList;
    val para: Option[Element] = children.filter(_.nodeName() == "p").take(amount).lastOption
    // if there is are no p's, just take the first n things (could be a blog)
    para match {
      case Some(p) => children.drop(children.indexOf(p)).foreach(_.remove())
      case _ => children.drop(amount).foreach(_.remove())
    }
    document
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
          <span itemscope="" itemtype="http://schema.org/Person" itemprop="author"><a rel="author" class="tone-colour" itemprop="url name" data-link-name="auto tag link" href={ s"/${tag.id}" } data-link-context={ s"${tag.id}" }>{ tag.name }</a></span>.toString)
    }
  }
  def apply(html: Html, tags: Seq[Tag]): Html = apply(html.body, tags)
}

object OmnitureAnalyticsData {
  def apply(page: MetaData, jsSupport: String, path: String)(implicit request: RequestHeader): Html = {

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
      ("g", path),
      ("ns", "guardian"),
      ("pageName", pageName),
      ("cdp", "2"),
      ("v7", pageName),
      ("c3", publication),
      ("ch", section),
      ("c9", section),
      ("c4", data.get("keywords").getOrElse("")),
      ("c6", data.get("author").getOrElse("")),
      ("c8", pageCode),
      ("v8", pageCode),
      ("c9", contentType),
      ("c10", data.get("tones").getOrElse("")),
      ("c11", section),
      ("c13", data.get("series").getOrElse("")),
      ("c25", data.get("blogs").getOrElse("")),
      ("c14", data("build-number")),
      ("c19", platform),
      ("v19", platform),
      ("v67", "nextgen-served"),
      ("c30", (if (isContent) "content" else "non-content")),
      ("c56", jsSupport)
    )

    Html(analyticsData map { case (key, value) => s"$key=${encode(value, "UTF-8")}" } mkString ("&"))
  }
}

object `package` extends Formats {

  private object inflector extends Inflector

  def withJsoup(html: Html)(cleaners: HtmlCleaner*): Html = withJsoup(html.body) { cleaners: _* }

  def withJsoup(html: String)(cleaners: HtmlCleaner*): Html = {
    val cleanedHtml = cleaners.foldLeft(Jsoup.parseBodyFragment(html)) { case (html, cleaner) => cleaner.clean(html) }
    Html(cleanedHtml.body.html)
  }

  implicit class Tags2tagUtils(t: Tags) {
    def typeOrTone: Option[Tag] = t.types.find(_.id != "type/article").orElse(t.tones.headOption)
  }

  implicit class Tags2inflector(t: Tag) {
    lazy val singularName: String = inflector.singularize(t.name)
    lazy val pluralName: String = inflector.pluralize(t.name)
  }

  implicit class Seq2zipWithRowInfo[A](seq: Seq[A]) {
    def zipWithRowInfo = seq.zipWithIndex.map {
      case (item, index) => (item, RowInfo(index + 1, seq.length == index + 1))
    }
  }
}

object Format {
  def apply(date: DateTime, pattern: String)(implicit request: RequestHeader): String = {
    val timezone = Edition(request).timezone
    date.toString(DateTimeFormat.forPattern(pattern).withZone(timezone))
  }
}

object cleanTrailText {
  def apply(text: String)(implicit edition: Edition): Html = {
    `package`.withJsoup(RemoveOuterParaHtml(BulletCleaner(text)))(InBodyLinkCleaner("in trail text link"))
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

object Head {
  def css = if (Play.isDev) volatileCss else persistantCss

  private def volatileCss: String = io.Source.fromInputStream(getClass.getResourceAsStream("/public/stylesheets/head.min.css")).mkString
  private lazy val persistantCss: String = volatileCss
}

object CricketMatch {
  def apply(trail: Trail): Option[String] = trail match {
    case c: Content => c.cricketMatch
    case _ => None
  }
}

object VisualTone {

  private val Comment = "comment"
  private val News = "news"
  private val Feature = "feature"

  private val toneMappings = Map(
    ("tone/comment", Comment),
    ("tone/letters", Comment),
    ("tone/obituaries", Comment),
    ("tone/profiles", Comment),
    ("tone/editorials", Comment),
    ("tone/analysis", Comment),

    ("tone/features", Feature),
    ("tone/recipes", Feature),
    ("tone/interview", Feature),
    ("tone/performances", Feature),
    ("tone/extract", Feature),
    ("tone/reviews", Feature),
    ("tone/albumreview", Feature),
    ("tone/livereview", Feature),
    ("tone/childrens-user-reviews", Feature)
  )


  def apply(tags: Tags) = tags.tones.headOption.flatMap(tone => toneMappings.get(tone.id)).getOrElse(News)

  // these tones are all considered to be 'News' it is the default so we do not list them explicitly
}
