package views.support

import java.net.URL
import java.util.regex.{Matcher, Pattern}

import common.{Edition, LinkTo}
import conf.Switches._
import layout.{WidthsByBreakpoint, ContentWidths}
import layout.ContentWidths._
import model._
import org.joda.time.DateTime
import org.jsoup.Jsoup
import org.jsoup.nodes.{TextNode, Element, Document}
import play.api.mvc.RequestHeader

import scala.collection.JavaConversions._

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

object BlockquoteCleaner extends HtmlCleaner {

  override def clean(document: Document): Document = {
    val quotedBlockquotes = document.getElementsByTag("blockquote").filter(_.hasClass("quoted"))
    val wrapBlockquoteChildren = (blockquoteElement: Element) => {
      val container = document.createElement("div")
      container.addClass("quoted__contents")
      // Get children before mutating
      val children = blockquoteElement.children()
      blockquoteElement.prependChild(container)
      container.insertChildren(0, children)
    }

    quotedBlockquotes.foreach(wrapBlockquoteChildren)
    document
  }

}

case class R2VideoCleaner(article: Article) extends HtmlCleaner {

  override def clean(document: Document): Document = {

    val legacyVideos = document.getElementsByTag("video").filter(_.hasClass("gu-video")).filter(_.parent().tagName() != "figure")

    legacyVideos.foreach( videoElement => {
      videoElement.wrap("<figure class=\"test element element-video\"></figure>")
    })

    document
  }

}

case class VideoEmbedCleaner(article: Article) extends HtmlCleaner {

  override def clean(document: Document): Document = {
    document.getElementsByClass("element-video").filter { element: Element =>
      element.getElementsByClass("gu-video").length == 0
    }.foreach { element: Element =>
      element.child(0).wrap("<div class=\"embed-video-wrapper u-responsive-ratio u-responsive-ratio--hd\"></div>")
    }

    if(!article.isLiveBlog) {
      document.getElementsByClass("element-video").foreach( element => {
        val shortUrl = element.attr("data-short-url")
        val webUrl = element.attr("data-canonical-url")
        val blockId = element.attr("data-media-id")
        val mediaPath = element.attr("data-video-poster")
        val mediaTitle = element.attr("data-video-name")

        if(!shortUrl.isEmpty) {
          val html = views.html.fragments.share.blockLevelSharing(blockId, article.elementShares(shortLinkUrl = shortUrl, webLinkUrl = webUrl,  mediaPath = Some(mediaPath), title = mediaTitle), article.contentType)
          element.child(0).after(html.toString())
          element.addClass("fig--has-shares")
          element.addClass("fig--narrow-caption")
          // add extra margin if there is no caption to fit the share buttons
          val figcaption = element.getElementsByTag("figcaption")
          if(figcaption.length < 1) {
            element.addClass("fig--no-caption")
          }
        }
      })
    }

    document.getElementsByClass("element-video").foreach { figure: Element =>
      val canonicalUrl = figure.attr("data-canonical-url")

      figure.getElementsByClass("gu-video").foreach { element: Element =>

        element
          .removeClass("gu-video")
          .addClass("js-gu-media--enhance gu-media gu-media--video")
          .wrap("<div class=\"gu-media-wrapper gu-media-wrapper--video u-responsive-ratio u-responsive-ratio--hd\"></div>")

        val flashMediaElement = conf.Static("flash/components/mediaelement/flashmediaelement.swf").path

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
        asset.flatMap(_.image).flatMap(Item640.bestFor).map(_.toString()).foreach { url =>
          element.attr("poster", url)
        }

        asset.foreach(video => {
          element.append(
            s"""<object type="application/x-shockwave-flash" data="$flashMediaElement" width="620" height="350">
                <param name="allowFullScreen" value="true" />
                <param name="movie" value="$flashMediaElement" />
                <param name="flashvars" value="controls=true&amp;file=${video.url.getOrElse("")}" />
                Sorry, your browser is unable to play this video.
              </object>""")

        })

        findVideoApiElement(mediaId).foreach{ videoElement =>
          element.attr("data-block-video-ads", videoElement.blockVideoAds.toString)
          if(!canonicalUrl.isEmpty && videoElement.embeddable) {
            element.attr("data-embeddable", "true")
            element.attr("data-embed-path", new URL(canonicalUrl).getPath.stripPrefix("/"))
          } else {
            element.attr("data-embeddable", "false")
          }
        }
      }
    }

    document.getElementsByClass("element-witness--main").foreach { element: Element =>
      element.select("iframe").wrap("<div class=\"u-responsive-ratio u-responsive-ratio--hd\"></div>")
    }

    document
  }

  def getVideoAssets(id:String): Seq[VideoAsset] = article.bodyVideos.filter(_.id == id).flatMap(_.videoAssets)

  def findVideoFromId(id:String): Option[VideoAsset] = getVideoAssets(id).find(_.mimeType == Some("video/mp4"))

  def findVideoApiElement(id:String): Option[VideoElement] = article.bodyVideos.filter(_.id == id).headOption
}

case class PictureCleaner(article: Article)(implicit request: RequestHeader) extends HtmlCleaner with implicits.Numbers {

  def replacePictures(body: Document): Document = {
    for {
      figure <- body.getElementsByTag("figure")
      image <- figure.getElementsByTag("img").headOption
      if !figure.hasClass("element-comment") && !figure.hasClass("element-witness")
      container <- findContainerFromId(figure.attr("data-media-id"), image.attr("src"))
      image <- container.largestImage
    }{
        val hinting = findBreakpointWidths(figure)
        val widths = ContentWidths.getWidthsFromContentElement(hinting, BodyMedia)

        val orientationClass = image.orientation match {
          case Portrait => Some("img--portrait")
          case _ => Some("img--landscape")
        }

        val smallImageClass = hinting match {
          case Thumbnail => None
          case _ if image.width <= 220 => Some("img--inline")
          case _ => None
        }

        val figureClasses = List(orientationClass, smallImageClass, hinting.className).flatten.mkString(" ")

        val html = views.html.fragments.contentImage(container, image, widths, figureClasses).toString()
        figure.replaceWith(Jsoup.parseBodyFragment(html).body().child(0))
    }

    body
  }

  private lazy val expandImage = views.html.fragments.inlineSvg("expand-image", "icon", List("centered-icon rounded-icon article__fullscreen")).toString()

  def addSharesAndFullscreen(body: Document): Document = {

    for {
      (imageElement, index) <- article.bodyFiltered.zipWithIndex
      if !article.isLiveBlog
      crop <- imageElement.largestEditorialCrop
      figure <- body.select("[data-media-id=" + imageElement.id + "]")
      image <- figure.getElementsByTag("img").headOption

    }{
      val linkIndex = (index + (if (article.mainFiltered.size > 0) 2 else 1)).toString
      val hashSuffix = "img-" + linkIndex
      figure.attr("id", hashSuffix)
      figure.addClass("fig--narrow-caption")
      figure.addClass("fig--has-shares")

      val figcaption = figure.getElementsByTag("figcaption")
      if(figcaption.length < 1) {
        figure.addClass("fig--no-caption")
      }

      val html = views.html.fragments.share.blockLevelSharing(hashSuffix, article.elementShares(Some(hashSuffix), crop.url), article.contentType)

      image.after(html.toString())
      image.wrap("<a href='" + article.url + "#img-" + linkIndex + "' class='article__img-container js-gallerythumbs' data-link-name='Launch Article Lightbox' data-is-ajax></a>")
      image.after(expandImage)
    }

    body
  }

  def clean(body: Document): Document = {
    addSharesAndFullscreen(replacePictures(body))
  }

  def findImageFromId(id: String, src: String, profile: Profile): Option[ImageAsset] = {
    findContainerFromId(id, src).flatMap(profile.elementFor)
  }

  def findContainerFromId(id: String, src: String): Option[ImageContainer] = {
    // It is possible that a single data media id can appear multiple times in the elements array.
    val srcImagePath = new java.net.URL(src).getPath()
    val imageContainers = article.bodyImages.filter(_.id == id)

    // Try to match the container based on both URL and media ID.
    val fullyMatchedImage: Option[ImageContainer] = {
      for {
        container <- imageContainers
        asset <- container.imageCrops
        url <- asset.url
        if url.contains(srcImagePath)
      } yield { container }
    }.headOption

    fullyMatchedImage.orElse(imageContainers.headOption)
  }

  def findBreakpointWidths(figure: Element): ContentHinting = {

    figure.classNames().map(Some(_)) match {
      case classes if classes.contains(Supporting.className) => Supporting
      case classes if classes.contains(Showcase.className) => Showcase
      case classes if classes.contains(Thumbnail.className) => Thumbnail
      case _ => Inline
    }
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
          time.wrap(s"""<a href="#$id" itemprop="url" class="block-time__link"></a>""")
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

case class LiveBlogLinkedData(isLiveBlog: Boolean)(implicit val request: RequestHeader) extends HtmlCleaner  {
  def clean(body: Document): Document = {
    if (isLiveBlog) {
      body.select(".block").foreach { el =>
        val id = el.id()
        el.attr("itemprop", "liveBlogUpdate")
        el.attr("itemscope", "")
        el.attr("itemtype", "http://schema.org/BlogPosting")
        el.select(".block-time.published-time time").foreach { time =>
          time.attr("itemprop", "datePublished")
        }
        el.select(".block-elements").foreach { body =>
          body.attr("itemprop", "articleBody")
        }
      }
    }
    body
  }
}

case class BloggerBylineImage(article: Article)(implicit val request: RequestHeader) extends HtmlCleaner  {
  def clean(body: Document): Document = {
    if (article.isLiveBlog) {
      body.select(".block").foreach { el =>
        val contributorId = el.attributes().get("data-block-contributor")
        if (contributorId.nonEmpty) {
          article.tags.find(_.id == contributorId).map{ contributorTag =>
            val html = views.html.fragments.meta.bylineLiveBlockImage(contributorTag)
            el.getElementsByClass("block-elements").headOption.foreach(_.prepend(html.toString()))
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
        val shares = article.elementShares(Some(blockId))

        val html = views.html.fragments.share.blockLevelSharing(blockId, shares, article.contentType)

        el.append(html.toString())
      }
    }
    body
  }
}

object BulletCleaner {
  def apply(body: String): String = body.replace("•", """<span class="bullet">•</span>""")
}

object VideoEncodingUrlCleaner{
  def apply(url: String): String = url.filter(_ != '\n')
}

case class InBodyLinkCleaner(dataLinkName: String)(implicit val edition: Edition, implicit val request: RequestHeader) extends HtmlCleaner {
  def clean(body: Document): Document = {
    val links = body.getElementsByAttribute("href")

    links.foreach { link =>
      if (link.tagName == "a") {
        link.attr("href", LinkTo(link.attr("href"), edition))
        link.attr("data-link-name", dataLinkName)
        link.attr("data-component", dataLinkName.replace(" ", "-"))
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

case class TagLinker(article: Article)(implicit val edition: Edition, implicit val request: RequestHeader) extends HtmlCleaner{

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

object MainFigCaptionCleaner extends HtmlCleaner {
  override def clean(document: Document): Document = {
    document.getElementsByTag("figcaption").foreach{ _.addClass("caption caption--img caption--main")}
    document
  }
}

object RichLinkCleaner extends HtmlCleaner {
  override def clean(document: Document): Document = {
    val richLinks = document.getElementsByClass("element-rich-link")
    richLinks
      .addClass("element-rich-link--not-upgraded")
      .attr("data-component", "rich-link")
      .zipWithIndex.map{ case (el, index) => el.attr("data-link-name", s"rich-link-${richLinks.length} | ${index+1}") }

    document
  }
}

object MembershipEventCleaner extends HtmlCleaner {
  override def clean(document: Document): Document = {
    val membershipEvents = document.getElementsByClass("element-membership")
    membershipEvents
      .addClass("element-membership--not-upgraded")
      .attr("data-component", "membership-events")
      .zipWithIndex.map{ case (el, index) => el.attr("data-link-name", s"membership-event-${membershipEvents.length} | ${index+1}") }

    document
  }
}
