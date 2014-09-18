package views.support

import common._
import conf.Switches.ShowAllArticleEmbedsSwitch
import model._

import java.net.URLEncoder._
import org.apache.commons.lang.StringEscapeUtils
import org.jboss.dna.common.text.Inflector
import org.joda.time.{LocalDate, DateTime}
import org.joda.time.format.DateTimeFormat
import org.jsoup.Jsoup
import org.jsoup.nodes.{ Element, Document }
import org.jsoup.safety.{ Whitelist, Cleaner }
import play.api.libs.json.Json._
import play.api.libs.json.{Json, JsValue, JsString, Writes}
import play.api.mvc.RequestHeader
import play.api.mvc.Result
import play.twirl.api.Html
import scala.collection.JavaConversions._
import java.text.DecimalFormat
import java.util.regex.Pattern

/**
 * New 'collection' templates
 */
sealed trait Container {
  val containerType: String
  val showMore: Boolean
  val tone: String
  val hasDarkBackground: Boolean = false
}

case class NewsContainer(showMore: Boolean = true) extends Container {
  val containerType = "news"
  val tone = "news"
}
case class CommentAndDebateContainer(showMore: Boolean = true) extends Container {
  val containerType = "commentanddebate"
  val tone = "comment"
}
case class FeaturesContainer(showMore: Boolean = true) extends Container {
  val containerType = "features"
  val tone = "feature"
}
case class FeaturesVolumesContainer(showMore: Boolean = true) extends Container {
  val containerType = "featuresvolumes"
  val tone = "feature"
}
case class FeaturesAutoContainer(showMore: Boolean = true) extends Container {
  val containerType = "featuresauto"
  val tone = "feature"
}
case class PopularContainer(showMore: Boolean = true) extends Container {
  val containerType = "popular"
  val tone = "news"
}
case class PeopleContainer(showMore: Boolean = true) extends Container {
  val containerType = "people"
  val tone = "feature"
}
case class SpecialContainer(showMore: Boolean = true, override val hasDarkBackground: Boolean = false) extends Container {
  val containerType = "special"
  val tone = "news"
}
case class MultimediaContainer(showMore: Boolean = true) extends Container {
  val containerType = "multimedia"
  val tone = "media"
  override val hasDarkBackground = true
}
case class SeriesContainer(showMore: Boolean = true) extends Container {
  val containerType = "series"
  val tone = "news"
}
case class MostReferredContainer(showMore: Boolean = true) extends Container {
  val containerType = "most-referred"
  val tone = "news"
}
case class HeadlineContainer(showMore: Boolean = true) extends Container {
  val containerType = "headline"
  val tone = "news"
}
case class PicksContainer(showMore: Boolean = true) extends Container {
  val containerType = "picks"
  val tone = "news"
}
case class CassouletContainer(showMore: Boolean = true) extends Container {
  val containerType = "cassoulet"
  val tone = "feature"
}
case class QuicheLorraineContainer(showMore: Boolean = true) extends Container {
  val containerType = "quichelorraine"
  val tone = "feature"
}
case class RacletteContainer(showMore: Boolean = true) extends Container {
  val containerType = "raclette"
  val tone = "feature"
}


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

case class VideoEmbedCleaner(contentVideos: Seq[VideoElement]) extends HtmlCleaner {

  override def clean(document: Document): Document = {
    document.getElementsByClass("element-video").filter { element: Element =>
      element.getElementsByClass("gu-video").length == 0
    }.foreach { element: Element =>
      element.child(0).wrap("<div class=\"embed-video-wrapper u-responsive-ratio u-responsive-ratio--hd\"></div>")
    }

    document.getElementsByClass("gu-video").foreach { element: Element =>

      element
        .removeClass("gu-video")
        .addClass("js-gu-media gu-media gu-media--video gu-media--show-controls-at-start")
        .wrap("<div class=\"gu-media-wrapper gu-media-wrapper--video u-responsive-ratio u-responsive-ratio--hd\"></div>")

      val flashMediaElement = conf.Static.apply("flash/flashmediaelement.swf").path

      val mediaId = element.attr("data-media-id")
      val asset = findVideoFromId(mediaId)

      element.getElementsByTag("source").remove()

      val sourceHTML: String = getVideoAssets(mediaId).map { videoAsset =>
        videoAsset.encoding.map { encoding =>
          s"""<source src="${encoding.url}" type="${encoding.format}"></source>"""
        }.getOrElse("")
      }.mkString("")

      element.append(sourceHTML)

      // add the poster url
      asset.flatMap(_.image).flatMap(Item640.bestFor).map(_.toString()).foreach{ url =>
        element.attr("poster", url)
      }

      asset.foreach( video => {
        element.append(
          s"""<object type="application/x-shockwave-flash" data="$flashMediaElement" width="620" height="350">
                <param name="allowFullScreen" value="true" />
                <param name="movie" value="$flashMediaElement" />
                <param name="flashvars" value="controls=true&amp;file=${video.url.getOrElse("")}" />
                Sorry, your browser is unable to play this video.
              </object>""")

      })
    }
    document
  }

  def getVideoAssets(id:String): Seq[VideoAsset] = contentVideos.filter(_.id == id).flatMap(_.videoAssets)

  def findVideoFromId(id:String): Option[VideoAsset] = getVideoAssets(id).find(_.mimeType == Some("video/mp4"))
}

case class PictureCleaner(contentImages: Seq[ImageElement]) extends HtmlCleaner with implicits.Numbers {

  def cleanStandardPictures(body: Document): Document = {
    body.getElementsByTag("figure").foreach { fig =>
      if(!fig.hasClass("element-comment") && !fig.hasClass("element-witness")) {
        fig.attr("itemprop", "associatedMedia")
        fig.attr("itemscope", "")
        fig.attr("itemtype", "http://schema.org/ImageObject")
        val asset = findImageFromId(fig.attr("data-media-id"))

        fig.getElementsByTag("img").foreach { img =>
          fig.addClass("img")
          img.attr("itemprop", "contentURL")

          asset.map { image =>
            image.url.map(url => img.attr("src", ImgSrc(url, Item620).toString))
            img.attr("width", s"${image.width}")

            //otherwise we mess with aspect ratio
            img.removeAttr("height")

            fig.addClass(image.width match {
              case width if width <= 220 => "img--base img--inline"
              case width if width < 460 => "img--median"
              case width => "img--extended"
            })
            fig.addClass(image.height match {
              case height if height > image.width => "img--portrait"
              case height if height < image.width => "img--landscape"
              case height => ""
            })
          }
        }
        fig.getElementsByTag("figcaption").foreach { figcaption =>

          // content api/ tools sometimes pops a &nbsp; in the blank field
          if (!figcaption.hasText || figcaption.text().length < 2) {
            figcaption.remove()
          } else {
            figcaption.attr("itemprop", "description")
          }
        }
      }
    }
    body
  }

  def cleanShowcasePictures(body: Document): Document = {
    for {
      element <- body.getElementsByClass("element--showcase")
      asset <- findContainerFromId(element.attr("data-media-id"))
      imagerSrc <- ImgSrc.imager(asset, Showcase)
      imgElement <- element.getElementsByTag("img")
    } {
      imgElement.wrap(s"""<div class="js-image-upgrade" data-src="$imagerSrc"></div>""")
      imgElement.addClass("responsive-img")
    }

    body
  }

  def clean(body: Document): Document = {
    cleanShowcasePictures(cleanStandardPictures(body))
  }

  def findImageFromId(id:String): Option[ImageAsset] = {
    findContainerFromId(id).flatMap(Item620.elementFor)
  }

  def findContainerFromId(id:String): Option[ImageContainer] = {
    contentImages.find(_.id == id)
  }
}

case class LiveBlogDateFormatter(isLiveBlog: Boolean)(implicit val request: RequestHeader) extends HtmlCleaner  {
  def clean(body: Document): Document = {
    if (isLiveBlog) {
      body.select(".block").foreach { el =>
        val id = el.id()
        el.select(".block-time.published-time time").foreach { time =>
            val datetime = DateTime.parse(time.attr("datetime"))
            val hhmm = Format(datetime, "HH:mm")
            time.wrap(s"""<a href="#$id" class="block-time__link"></a>""")
            time.attr("data-relativeformat", "med")
            time.after( s"""<span class="block-time__absolute">$hhmm</span>""")
            if (datetime.isAfter(DateTime.now().minusDays(5))) {
              time.addClass("js-timestamp")
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

case class InBodyLinkCleaner(dataLinkName: String)(implicit val edition: Edition, implicit val request: RequestHeader) extends HtmlCleaner {
  def clean(body: Document): Document = {
    val links = body.getElementsByAttribute("href")

    links.foreach { link =>
      if (link.tagName == "a") {
        link.attr("href", LinkTo(link.attr("href"), edition))
        link.attr("data-link-name", dataLinkName)
        link.addClass("u-underline")
      }
    }

    // Prevent text in non clickable anchors from looking like links
    // <a name="foo">bar</a> -> <a name="foo"></a>bar
    val anchors = body.getElementsByAttribute("name")

    anchors.foreach { anchor =>
      if (anchor.tagName == "a") {
        val text = anchor.ownText()
        anchor.empty().after(text)
      }
    }

    body
  }
}

// TODO make this separate
// this does not fix other links, just the ones in these pages.
case class InBodyLinkCleanerForR1(section: String) extends HtmlCleaner {

  private val subdomains = "^/(Business|Music|Lifeandhealth|Users|Sport|Books|Media|Society|Travel|Money|Education|Arts|Politics|Observer|Football|Film|Technology|Environment|Shopping|Century)/(.*)".r

  def FixR1Link(href: String, section: String = "") = {

    /**
     * We moved some R1 HTML files from subdomains to www.theguardian.com.
    * This means we broke some of the <a href="...">'s in the HTML.
    *
    * Here's how this works :-
    *
    * 1. /Books/reviews/travel/0,,343395,.html -> /books/reviews/travel/0,,343395,.html
    *       - Downcase the old subdomain paths.
    *
    * 2. /Film_Page/0,,594132,00.html -> /film/Film_Page/0,,594132,00.html
    *       - Prefix the current section to any links without a path in them.
    *
    * 3. /Guardian/film/2002/jan/12/awardsandprizes.books -> /film/2002/jan/12/awardsandprizes.books
    *       - The /Guardian path is an alias for the root (www), so we just remove it.
    *
    * 4. http://...
    *       - Ignore any links that contain a full URL.
    */

    // #1
    href match {
      case subdomains(section, path) => s"/${section.toLowerCase}/$path"
      case _ =>
        if (href.contains("/Guardian"))
          href.replace("/Guardian", "") // #2
        else
          s"$section$href" // #3
    }
  }

  def clean(body: Document): Document = {
    val links = body.getElementsByTag("a")
    links.filter(_.attr("href") startsWith "/") // #4
    .foreach(link => link.attr("href", FixR1Link(link.attr("href"), section)))

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

class TagLinker(article: Article)(implicit val edition: Edition, implicit val request: RequestHeader) extends HtmlCleaner{

  private val group1 = "$1"
  private val group2 = "$2"
  private val group4 = "$4"
  private val group5 = "$5"

  private val dot = Pattern.quote(".")
  private val question = Pattern.quote("?")

  private def keywordRegex(tag: Tag) = {
    val tagName = Pattern.quote(tag.name)
    s"""(.*)( |^)($tagName)( |,|$$|$dot|$question)(.*)""".r
  }

  def clean(doc: Document): Document = {

    if (article.showInRelated) {

      val paragraphs = doc.getElementsByTag("p")

      // order by length of name so we do not make simple match errors
      // e.g 'Northern Ireland' & 'Ireland'
      article.keywords.filterNot(_.isSectionTag).sortBy(_.name.length).reverse.foreach { keyword =>

        // don't link again in paragraphs that already have links
        val unlinkedParas = paragraphs.filterNot(_.html.contains("<a"))

        // pre-filter paragraphs so we do not do multiple regexes on every single paragraph in every single article
        val candidateParagraphs = unlinkedParas.filter(_.html.contains(keyword.name))

        if (candidateParagraphs.nonEmpty) {
          val regex = keywordRegex(keyword)
          val paragraphsWithMatchers = candidateParagraphs.map(p => (regex.pattern.matcher(p.html), p)).find(_._1.matches())

          paragraphsWithMatchers.foreach { case (matcher, p) =>
            val tagLink = doc.createElement("a")
            tagLink.attr("href", LinkTo(keyword.url, edition))
            tagLink.text(keyword.name)
            tagLink.attr("data-link-name", "auto-linked-tag")
            tagLink.addClass("u-underline")
            val tagLinkHtml = tagLink.toString
            val newHtml = matcher.replaceFirst(s"$group1$group2$tagLinkHtml$group4$group5")
            p.html(newHtml)
          }
        }
      }
    }
    doc
  }
}

object InBodyElementCleaner extends HtmlCleaner {

  private val supportedElements = Set(
    "element-tweet",
    "element-video",
    "element-image",
    "element-witness",
    "element-comment",
    "element-interactive"
  )

  override def clean(document: Document): Document = {
    // this code REMOVES unsupported embeds
    if(ShowAllArticleEmbedsSwitch.isSwitchedOff) {
      val embeddedElements = document.getElementsByTag("figure").filter(_.hasClass("element"))
      val unsupportedElements = embeddedElements.filterNot(e => supportedElements.exists(e.hasClass))
      unsupportedElements.foreach(_.remove())
    }
    document
  }
}

case class Summary(amount: Int) extends HtmlCleaner {
  override def clean(document: Document): Document = {
    val children = document.body().children().toList
    val para: Option[Element] = children.filter(_.nodeName() == "p").take(amount).lastOption
    // if there is are no p's, just take the first n things (could be a blog)
    para match {
      case Some(p) => children.drop(children.indexOf(p)).foreach(_.remove())
      case _ => children.drop(amount).foreach(_.remove())
    }
    document
  }
}

case class DropCaps(isFeature: Boolean) extends HtmlCleaner {

  private def setDropCap(p: Element): String = {
    val html = p.html
    if ( html.length > 200 && html.matches("^[\"a-hj-zA-HJ-Z].*") && html.split("\\s+").head.length >= 3 ) {
      val classes = if (html.length > 325) "drop-cap drop-cap--wide" else "drop-cap"
      s"""<span class="${classes}"><span class="drop-cap__inner">${html.head}</span></span>${html.tail}"""
    } else {
      html
    }
  }

  override def clean(document: Document): Document = {

    if(isFeature) {
      val children = document.body().children().toList
      children.headOption match {
        case Some(p) => {
          if (p.nodeName() == "p") p.html(setDropCap(p))
        }
        case _ =>
      }
    }
    document
  }
}

object FigCaptionCleaner extends HtmlCleaner {
  override def clean(document: Document): Document = {
    document.getElementsByTag("figcaption").foreach{ _.addClass("caption caption--img")}
    document
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
          <span itemscope="" itemtype="http://schema.org/Person" itemprop="author"><a rel="author" class="tone-colour" itemprop="url name" data-link-name="auto tag link" href={s"${LinkTo("/"+tag.id)}"}>{tag.name}</a></span>.toString())
    }
  }
  def apply(html: Html, tags: Seq[Tag])(implicit request: RequestHeader): Html = apply(html.body, tags)
}

object OmnitureAnalyticsData {
  def apply(page: MetaData, jsSupport: String, path: String)(implicit request: RequestHeader): Html = {

    val data = page.metaData map {
      case (key, JsString(s)) => key -> s
      case (key, jValue: JsValue) => key -> Json.stringify(jValue)
    }
    val pageCode = data.getOrElse("pageCode", "")
    val contentType = data.getOrElse("contentType", "")
    val section = data.getOrElse("section", "")
    val platform = "frontend"
    val publication = data.getOrElse("publication", "")
    val omnitureEvent = data.getOrElse("omnitureEvent", "")
    val registrationType = data.getOrElse("registrationType", "")
    val omnitureErrorMessage = data.getOrElse("omnitureErrorMessage", "")

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
      ("c4", data.getOrElse("keywords", "")),
      ("c6", data.getOrElse("author", "")),
      ("c8", pageCode),
      ("v8", pageCode),
      ("c9", contentType),
      ("c10", data.getOrElse("tones", "")),
      ("c11", section),
      ("c13", data.getOrElse("series", "")),
      ("c25", data.getOrElse("blogs", "")),
      ("c14", data("buildNumber")),
      ("c19", platform),
      ("v19", platform),
      ("v67", "nextgenServed"),
      ("c30", if (isContent) "content" else "non-content"),
      ("c56", jsSupport),
      ("event", omnitureEvent),
      ("v23", registrationType),
      ("e27", omnitureErrorMessage)
    )


    Html(analyticsData map { case (key, value) => s"$key=${encode(value, "UTF-8")}" } mkString "&")
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
  def gonePage(implicit request: RequestHeader) = model.Page(request.path, "news", "This page has been removed", "GFE:Gone")
  def apply(result: Result)(implicit request: RequestHeader) = result.header.status match {
    case 404 => NoCache(NotFound)
    case 410 if request.isJson => Cached(60)(JsonComponent(gonePage, "status" -> "GONE"))
    case 410 => Cached(60)(Gone(views.html.expired(gonePage)))
    case _ => result
  }
}

object RenderClasses {

  def apply(classes: Map[String, Boolean]): String = apply(classes.filter(_._2).keys.toSeq:_*)

  def apply(classes: String*): String = classes.filter(_.nonEmpty).sorted.mkString(" ")

}

object GetClasses {

  def forCollectionItem(trail: Trail,
                        additionalClasses: String = ""): String = {
    val f: Seq[(Trail) => String] = Seq(
      (trail: Trail) => trail match {
        case _: Gallery => "facia-slice__item--content-type-gallery"
        case _: Video   => "facia-slice__item--content-type-video"
        case _: Audio   => "facia-slice__item--content-type-audio"
        case _          => ""
      }
    )
    val baseClasses: Seq[String] = Seq(
      additionalClasses,
      "l-row__item",
      "facia-slice__item",
      "u-faux-block-link",
      s"facia-slice__item--volume-${trail.group.getOrElse("0")}"
    )
    val classes = f.foldLeft(baseClasses){case (cl, fun) => cl :+ fun(trail)} ++ makeSnapClasses(trail)
    RenderClasses(classes:_*)
  }

  def forNewStyleItem(trail: Trail, isFirstContainer: Boolean): String = {
    RenderClasses(
      TrailCssClasses.toneClass(trail) +: commonFcItemClasses(trail, isFirstContainer, forceHasImage = false): _*
    )
  }

  def commonFcItemClasses(trail: Trail, isFirstContainer: Boolean, forceHasImage: Boolean): Seq[String] = {
    val itemClass = trail match {
      case _: Gallery => Some("fc-item--gallery")
      case _: Video => Some("fc-item--video")
      case _: Audio => Some("fc-item--audio")
      case _ => None
    }

    val imageClass = if (!forceHasImage && (trail.trailPicture(5,3).isEmpty || trail.imageAdjust == "hide")) {
      "fc-item--has-no-image"
    } else {
      "fc-item--has-image"
    }

    val discussionClass = if (trail.isCommentable) "item--has-discussion" else "item--has-no-discussion"

    Seq(
      "fc-item",
      imageClass,
      discussionClass
    ) ++ Seq(
      itemClass,
      if (isFirstContainer) Some("fc-item--force-image-upgrade") else None,
      if (trail.isLive) Some("fc-item--live") else None,
      if (trail.isComment && trail.hasLargeContributorImage) Some("fc-item--has-cutout") else None,
      if (forceHasImage || trail.trailPicture(5,3).nonEmpty)
        Some(s"fc-item--imageadjust-${trail.imageAdjust}")
      else
        None
    ).flatten ++ makeSnapClasses(trail)
  }


  def commonItemClasses(trail: Trail, isFirstContainer: Boolean, forceHasImage: Boolean): Seq[String] = {
    val itemClass = trail match {
      case _: Gallery => Some("item--gallery")
      case _: Video => Some("item--video")
      case _: Audio => Some("item--audio")
      case _ => None
    }

    val imageClass = if (!forceHasImage && (trail.trailPicture(5,3).isEmpty || trail.imageAdjust == "hide")) {
      "item--has-no-image"
    } else {
      "item--has-image"
    }

    val discussionClass = if (trail.isCommentable) "item--has-discussion" else "item--has-no-discussion"

    Seq(
      "item",
      imageClass,
      discussionClass
    ) ++ Seq(
      itemClass,
      if (isFirstContainer) Some("item--force-image-upgrade") else None,
      if (trail.isLive) Some("item--live") else None,
      if (trail.isComment && trail.hasLargeContributorImage) Some("item--has-cutout") else None,
      if (forceHasImage || trail.trailPicture(5,3).nonEmpty)
        Some(s"item--imageadjust-${trail.imageAdjust}")
      else
        None
    ).flatten ++ makeSnapClasses(trail)
  }

  def forItem(
    trail: Trail,
    firstContainer: Boolean,
    forceHasImage: Boolean = false,
    forceTone: Option[String] = None
  ): String = {
    RenderClasses(
      s"tone-${forceTone.getOrElse(trail.visualTone)}" +: commonItemClasses(trail, firstContainer, forceHasImage): _*
    )
  }

  def forFromage(trail: Trail, imageAdjust: String): String = {
    val baseClasses: Seq[String] = Seq(
      "fromage",
      s"tone-${trail.visualTone}",
      "u-faux-block-link",
      "tone-accent-border"
    )
    val f: Seq[(Trail, String) => String] = Seq(
      (trail: Trail, imageAdjust: String) =>
        if (trail.isLive) "item--live" else "",
      (trail: Trail, imageAdjust: String) =>
        if (trail.trailPicture(5,3).isEmpty || imageAdjust == "hide"){
          "fromage--has-no-image"
        }else{
          "fromage--has-image"
        },
      (trail: Trail, imageAdjust: String) =>
        if (!trail.trailPicture(5,3).isEmpty) s"fromage--imageadjust-$imageAdjust" else "",
      (trail: Trail, imageAdjust: String) =>
        if (trail.isCommentable) "fromage--has-discussion" else "fromage--has-no-discussion"
    )
    val classes = f.foldLeft(baseClasses){case (cl, fun) => cl :+ fun(trail, imageAdjust)} ++ makeSnapClasses(trail)
    RenderClasses(classes:_*)
  }

  def forSaucisson(trail: Trail): String = {
    val baseClasses: Seq[String] = Seq(
      "saucisson",
      s"tone-${trail.visualTone}",
      "u-faux-block-link",
      "tone-accent-border"
    )
    val f: Seq[(Trail) => String] = Seq(
      (trail: Trail) =>
        if (trail.isLive) "item--live" else ""
    )
    val classes = f.foldLeft(baseClasses){case (cl, fun) => cl :+ fun(trail)} ++ makeSnapClasses(trail)
    RenderClasses(classes:_*)
  }

  def makeSnapClasses(trail: Trail): Seq[String] = trail match {
    case snap: Snap => "facia-snap" +: snap.snapCss.map(t => Seq(s"facia-snap--$t")).getOrElse(Seq("facia-snap--default"))
    case _  => Nil
  }

  private def commonContainerStyles(config: Config, isFirst: Boolean, hasTitle: Boolean): Seq[String] = {
    Seq(
      "container" -> true,
      "container--sponsored" -> config.isSponsored,
      "container--advertisement-feature" -> (config.isAdvertisementFeature && ! config.isSponsored),
      "container--first" -> isFirst,
      "js-container--toggle" -> (!isFirst && hasTitle && !(config.isAdvertisementFeature || config.isSponsored))
    ) collect {
      case (kls, true) => kls
    }
  }

  def forNewStyleContainer(config: Config, isFirst: Boolean, hasTitle: Boolean, extraClasses: Seq[String] = Nil) = {
    RenderClasses(
      "fc-container" +:
        (commonContainerStyles(config, isFirst, hasTitle) ++
        extraClasses): _*
    )
  }

  def forContainer(container: Container, config: Config, index: Int, hasTitle: Boolean, extraClasses: Seq[String] = Nil): String = {
    val oldClasses = Seq(
      Some("container--dark-background").filter(Function.const(container.hasDarkBackground))
    ).flatten

    RenderClasses(
      s"container--${container.containerType}" +:
        (commonContainerStyles(config, index == 0, hasTitle) ++
        extraClasses ++ oldClasses): _*
    )
  }
}

object LatestUpdate {

  def apply(collection: Collection, trails: Seq[Trail]): Option[DateTime] =
    (trails.map(_.webPublicationDate) ++ collection.lastUpdated.map(DateTime.parse(_))).sortBy(-_.getMillis).headOption

}

object SnapData {
  def apply(trail: Trail): String = generateDataArrtibutes(trail).mkString(" ")

  private def generateDataArrtibutes(trail: Trail): Iterable[String] = trail match {
    case snap: Snap =>
      snap.snapType.filter(_.nonEmpty).map(t => s"data-snap-type=$t") ++
      snap.snapUri.filter(_.nonEmpty).map(t => s"data-snap-uri=$t")
    case _  => Nil
  }
}
