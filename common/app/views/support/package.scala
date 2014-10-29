package views.support

import com.gu.facia.client.models.CollectionConfig
import common._
import conf.Switches.ShowAllArticleEmbedsSwitch
import dfp.DfpAgent
import layout.ContainerAndCollection
import model._

import java.net.URLEncoder._
import org.apache.commons.lang.StringEscapeUtils
import org.jboss.dna.common.text.Inflector
import org.joda.time.{LocalDate, DateTime}
import org.joda.time.format.DateTimeFormat
import org.jsoup.Jsoup
import org.jsoup.nodes.{ Element, Document, TextNode }
import org.jsoup.safety.{ Whitelist, Cleaner }
import play.api.libs.json.Json._
import play.api.libs.json.{Json, JsValue, JsString, Writes}
import play.api.mvc.RequestHeader
import play.api.mvc.Result
import play.twirl.api.Html
import scala.collection.JavaConversions._
import java.text.DecimalFormat
import java.util.regex.{Matcher, Pattern}

/**
 * New 'collection' templates
 */
sealed trait Container {
  val containerType: String
  val showMore: Boolean
  val tone: String
  val hasDarkBackground: Boolean = false
}
case class PopularContainer(showMore: Boolean = true) extends Container {
  val containerType = "popular"
  val tone = "news"
}
case class MostReferredContainer(showMore: Boolean = true) extends Container {
  val containerType = "most-referred"
  val tone = "news"
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

    document.getElementsByClass("element-witness--main").foreach { element: Element =>
      element.select("iframe").wrap("<div class=\"u-responsive-ratio u-responsive-ratio--hd\"></div>")
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

case class LiveBlogShareButtons(article: Article)(implicit val request: RequestHeader) extends HtmlCleaner  {
  def clean(body: Document): Document = {
    if (article.isLiveBlog) {
      body.select(".block").foreach { el =>
        val blockId = el.id()
        val shares = article.blockLevelShares(blockId)
        val link = article.blockLevelLink(blockId)

        val html = views.html.fragments.share.blockLevelSharing(blockId, shares, link, article.contentType)

        el.append(html.toString())
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

object InBodyLinkDataComponentCleaner extends HtmlCleaner {
  def clean(body: Document): Document = {
    body.getElementsByTag("a").foreach { link =>
      link.attr("data-component", "in-body-link")
    }
    body
  }
}

case class TruncateCleaner(limit: Int)(implicit val edition: Edition, implicit val request: RequestHeader) extends HtmlCleaner {
  def clean(body: Document): Document = {

    def truncateTextNode(charLimit: Int, textNode: TextNode): Int = {
      val newCharLimit = charLimit - textNode.text.length
      if (newCharLimit < 0) {
        textNode.text(textNode.text.take(charLimit.max(0)).trim.stripSuffix(".") + (if (charLimit > 0) "…" else ""))
      }
      newCharLimit
    }

    def truncateElement(charLimit: Int, element: Element): Int = {
      element.childNodes.foldLeft(charLimit) {
        (t, node) =>
          if (node.isInstanceOf[TextNode]) {
            truncateTextNode(t, node.asInstanceOf[TextNode])
          } else if (node.isInstanceOf[Element]) {
            truncateElement(t, node.asInstanceOf[Element])
          } else {
            t
          }
      }
    }

    truncateElement(limit, body)
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
        val link = document.createElement("a").attr("href", date.attr("href")).attr("style", "display: none;")

        element.empty().attr("class", "js-tweet tweet")
        element.appendChild(userEl).appendChild(date).appendChild(body).appendChild(link)
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
    val tagName = Pattern.quote(Matcher.quoteReplacement(tag.name))
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
            tagLink.attr("data-component", "auto-linked-tag")
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
        s"""<span itemscope="" itemtype="http://schema.org/Person" itemprop="author">
           |  <a rel="author" class="tone-colour" itemprop="url name" data-link-name="auto tag link"
           |    href="${LinkTo("/"+tag.id)}">${tag.name}</a></span>""".stripMargin)
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

object ContentLayout {
  implicit class ContentLayout(content: model.Content) {

    def showBottomSocialButtons: Boolean = {
      content match {
        case l: LiveBlog => true
        case a: Article => Jsoup.parseBodyFragment(a.body).select("> *").text().length > 600
        case i: ImageContent => false
        case m: Media => false
        case g: Gallery => false
        case _ => true
      }
    }

    def submetaBreakpoint: Option[String] = {
      content match {
        case a: LiveBlog => None
        case a: Article if !a.hasSupportingAtBottom => Some("leftcol")
        case v: Video if(v.standfirst.getOrElse("").length > 350) => Some("leftcol")
        case a: Audio if(a.body.getOrElse("").length > 800) => Some("leftcol")
        case i: ImageContent if (i.mainPicture.flatMap(_.largestEditorialCrop).exists(crop => crop.height / crop.width.toFloat > 0.5)) => Some("wide")
        case g: Gallery => Some("leftcol")
        case _ => None
      }
    }

    def tagTone: Option[String] = {
      content match {
        case l: LiveBlog => Some(l.visualTone)
        case m: Media => Some("media")
        case g: Gallery => Some("media")
        case i: ImageContent if(!i.isCartoon) => Some("media")
        case _ => None
      }
    }
  }
}

object `package` extends Formats {

  private object inflector extends Inflector

  def withJsoup(html: Html)(cleaners: HtmlCleaner*): Html = withJsoup(html.body) { cleaners: _* }

  def withJsoup(html: String)(cleaners: HtmlCleaner*): Html = {
    val cleanedHtml = cleaners.foldLeft(Jsoup.parseBodyFragment(html)) { case (html, cleaner) => cleaner.clean(html) }
    Html(cleanedHtml.body.html)
  }

  def getTagContainerDefinition(page: MetaData) = {
    if (page.isContributorPage) {
      slices.TagContainers.contributorTagPage
    } else if (page.keywords.nonEmpty) {
      slices.TagContainers.keywordPage
    } else {
      slices.TagContainers.tagPage
    }
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

  def apply(classes: String*): String = classes.filter(_.nonEmpty).sorted.distinct.mkString(" ")
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

  def forNewStyleItem(trail: Trail, isFirstContainer: Boolean, numberOfSublinks: Int): String = {
    val cutOutClass = if (CutOut.fromTrail(trail).isDefined) {
      Seq("fc-item--has-cutout")
    } else {
      Seq.empty
    }

    RenderClasses(
      TrailCssClasses.toneClass(trail, "--item") +:
        (commonFcItemClasses(trail, isFirstContainer, forceHasImage = false, numberOfSublinks) ++
        cutOutClass): _*
    )
  }

  def forSubLink(trail: Trail) = RenderClasses(Seq(
    Some("fc-sublink"),
    Some(TrailCssClasses.toneClass(trail, "--sublink")),
    sublinkMediaTypeClass(trail)
  ).flatten: _*)

  def mediaTypeClass(trail: Trail) = trail match {
    case _: Gallery => Some("fc-item--gallery")
    case _: Video => Some("fc-item--video")
    case _: Audio => Some("fc-item--audio")
    case _ => None
  }

  def sublinkMediaTypeClass(trail: Trail) = trail match {
    case _: Gallery => Some("fc-sublink--gallery")
    case _: Video => Some("fc-sublink--video")
    case _: Audio => Some("fc-sublink--audio")
    case _ => None
  }

  def commonFcItemClasses(
      trail: Trail,
      isFirstContainer: Boolean,
      forceHasImage: Boolean,
      numberOfSublinks: Int
  ): Seq[String] = {
    val itemClass = mediaTypeClass(trail)

    val imageClass = if (!forceHasImage && (trail.trailPicture(5, 3).isEmpty || trail.imageHide)) {
      "fc-item--has-no-image"
    } else {
      "fc-item--has-image"
    }

    val discussionClass = if (trail.isCommentable) "item--has-discussion" else "item--has-no-discussion"

    Seq(
      "fc-item",
      "js-fc-item",
      imageClass,
      discussionClass
    ) ++ Seq(
      itemClass,
      if (isFirstContainer) Some("fc-item--force-image-upgrade") else None,
      if (trail.isLive) Some("fc-item--live") else None,
      if (trail.supporting.nonEmpty) Some(s"fc-item--has-sublinks-$numberOfSublinks") else None,
      if (trail.showBoostedHeadline) Some("fc-item--has-boosted-title") else None,

      if (forceHasImage || trail.trailPicture(5, 3).nonEmpty) {
        if (trail.isBoosted)
          Some("item--imageadjust-boost")
        else if (trail.imageHide)
          Some("item--imageadjust-hide")
        else
          Some("item--imageadjust-default")
      } else {
        None
      }
    ).flatten ++ makeSnapClasses(trail)
  }


  def commonItemClasses(trail: Trail, isFirstContainer: Boolean, forceHasImage: Boolean): Seq[String] = {
    val itemClass = trail match {
      case _: Gallery => "item--gallery"
      case _: Video => "item--video"
      case _: Audio => "item--audio"
      case _ => ""
    }

    val imageClass = if (!forceHasImage && (trail.trailPicture(5,3).isEmpty || trail.imageHide)) {
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
      if (isFirstContainer) "item--force-image-upgrade" else "",
      if (trail.isLive) "item--live" else "",
      if (trail.isComment && trail.hasLargeContributorImage) "item--has-cutout" else "",
      if (forceHasImage || trail.trailPicture(5,3).nonEmpty)
        if(trail.isBoosted) "item--imageadjust-boost" else if(trail.imageHide) "item--imageadjust-hide" else "item--imageadjust-default"
      else
        ""
    ) ++ makeSnapClasses(trail)
  }

  def forItem(trail: Trail,
              firstContainer: Boolean,
              forceHasImage: Boolean = false,
              forceTone: Option[String] = None): String = {
    val tone = forceTone.getOrElse(trail.visualTone)
    val baseClasses: Seq[String] = Seq(
      "item",
      s"tone-${tone}"
    )
    val f: Seq[(Trail, Boolean, Boolean, Option[String]) => String] = Seq(
      (trail: Trail, firstContainer: Boolean, forceHasImage: Boolean, forceTone: Option[String]) => trail match {
        case _: Gallery => "item--gallery"
        case _: Video => "item--video"
        case _: Audio => "item--audio"
        case _ => ""
      },
      (trail: Trail, firstContainer: Boolean, forceHasImage: Boolean, forceTone: Option[String]) =>
        if (firstContainer) "item--force-image-upgrade" else "",
      (trail: Trail, firstContainer: Boolean, forceHasImage: Boolean, forceTone: Option[String]) =>
        if (trail.isLive) "item--live" else "",
      (trail: Trail, firstContainer: Boolean, forceHasImage: Boolean, forceTone: Option[String]) =>
        if (forceHasImage == false && (trail.trailPicture(5,3).isEmpty || trail.imageHide)){
          "item--has-no-image"
        }else{
          "item--has-image"
        },
      (trail: Trail, firstContainer: Boolean, forceHasImage: Boolean, forceTone: Option[String]) =>
        if (forceHasImage || !trail.trailPicture(5,3).isEmpty){
          if(trail.isBoosted) "item--imageadjust-boost" else if(trail.imageHide) "item--imageadjust-hide" else "item--imageadjust-default"
        } else "",
      (trail: Trail, firstContainer: Boolean, forceHasImage: Boolean, forceTone: Option[String]) =>
        if (trail.isCommentable) "item--has-discussion" else "item--has-no-discussion"
    )
    val classes = f.foldLeft(baseClasses){case (cl, fun) => cl :+ fun(trail, firstContainer, forceHasImage, forceTone)} ++ makeSnapClasses(trail)
    RenderClasses(classes:_*)
  }

  def makeSnapClasses(trail: Trail): Seq[String] = trail match {
    case content: Content => "js-snap facia-snap" +: content.snapCss.map(t => Seq(s"facia-snap--$t")).getOrElse(Seq("facia-snap--default"))
    case _  => Nil
  }

  private def commonContainerStyles(config: CollectionConfig, isFirst: Boolean, hasTitle: Boolean): Seq[String] = {
    Seq(
      ("container", true),
      ("container--first", isFirst),
      ("container--sponsored", DfpAgent.isSponsored(config)),
      ("container--advertisement-feature", DfpAgent.isAdvertisementFeature(config)),
      ("container--foundation-supported", DfpAgent.isFoundationSupported(config)),
      ("js-sponsored-container", (
        (DfpAgent.isSponsored(config) || DfpAgent.isAdvertisementFeature(config) || DfpAgent.isFoundationSupported(config))
      )),
      ("js-container--toggle", (!isFirst && hasTitle && !(DfpAgent.isAdvertisementFeature(config) || DfpAgent.isSponsored(config))))
    ) collect {
      case (kls, true) => kls
    }
  }

  def forContainerDefinition(containerDefinition: ContainerAndCollection) =
    forNewStyleContainer(
      containerDefinition.config.config,
      containerDefinition.index == 0,
      containerDefinition.displayName.isDefined
    )

  def forNewStyleContainer(config: CollectionConfig, isFirst: Boolean, hasTitle: Boolean, extraClasses: Seq[String] = Nil) = {
    RenderClasses(
      (if (config.showLatestUpdate.exists(identity)) Some("js-container--fetch-updates") else None).toSeq ++
        Seq("fc-container") ++
        commonContainerStyles(config, isFirst, hasTitle) ++
        extraClasses: _*
    )
  }
}

object SnapData {
  def apply(trail: Trail): String = generateDataAttributes(trail).mkString(" ")

  private def generateDataAttributes(trail: Trail): Iterable[String] = trail match {
    case content: Content =>
        content.snapType.filter(_.nonEmpty).map(t => s"data-snap-type=$t") ++
        content.snapUri.filter(_.nonEmpty).map(t => s"data-snap-uri=$t")
    case _  => Nil
  }
}
