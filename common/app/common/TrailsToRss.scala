package common

import com.gu.facia.api.models.LinkSnap
import com.sun.syndication.feed.module.DCModuleImpl
import com.sun.syndication.feed.module.mediarss._
import com.sun.syndication.feed.module.mediarss.types.{Credit, MediaContent, Metadata, UrlReference}
import com.sun.syndication.feed.synd._
import com.sun.syndication.io.SyndFeedOutput
import model._
import model.liveblog.{Blocks, TextBlockElement}
import model.pressed.PressedStory
import org.jsoup.Jsoup
import play.api.mvc.RequestHeader
import views.support.{ImageProfile, Item140, Item460}

import java.io.StringWriter
import java.text.SimpleDateFormat
import java.util.regex.Pattern
import java.util.{Date, TimeZone}
import scala.jdk.CollectionConverters._

object RssDates {
  def getYear(date: Date): String = {
    val formatter = new SimpleDateFormat("YYYY")
    formatter.setTimeZone(TimeZone.getTimeZone("Europe/London"))
    formatter.format(date)
  }
}

object TrailsToRss extends implicits.Collections {

  // The CAPI blocks we would like consumers to request to build our item intro text from
  val BlocksToGenerateRssIntro = "body:oldest:10"

  /*
    This regex pattern matches all invalid XML characters (see https://www.w3.org/TR/xml/#charsets)
    by specifying individual and ranges of valid ones in a negated set.  The final range \\u10000-\\u10FFFF
    is intended to match the supplementary character set, but I believe it is invalid java regex.
    It ought to be changed to \\x{10000}-\\x{10FFFF} but that produces unexpected behaviour which I suspect
    is a bug (http://bugs.java.com/bugdatabase/view_bug.do?bug_id=JDK-8179668).  For now, leaving this
    unchanged as the end result gives valid XML, although it may exclude supplementary characters.
   */
  val pattern = Pattern.compile("[^\\x09\\x0A\\x0D\\x20-\\uD7FF\\uE000-\\uFFFD\\u10000-\\u10FFFF]")
  def stripInvalidXMLCharacters(s: String) = {
    pattern.matcher(s).replaceAll("")
  }

  val image: SyndImageImpl = {
    // Feed: image
    val image = new SyndImageImpl
    image.setLink("https://www.theguardian.com")

    // This image fits this spec. - https://support.google.com/news/publisher/answer/1407682
    image.setUrl("https://assets.guim.co.uk/images/guardian-logo-rss.c45beb1bafa34b347ac333af2e6fe23f.png")
    image.setTitle("The Guardian")
    image
  }

  def apply(metaData: MetaData, content: Seq[Content])(implicit request: RequestHeader): String =
    TrailsToRss(Some(metaData.webTitle), content, Some(metaData.url), metaData.description)

  def apply(
      title: Option[String],
      content: Seq[Content],
      url: Option[String] = None,
      description: Option[String] = None,
  )(implicit
      request: RequestHeader,
  ): String = {
    val feedTitle = title.map(t => s"$t | The Guardian").getOrElse("The Guardian")

    // Feed
    val feed = new SyndFeedImpl
    feed.setFeedType("rss_2.0")
    feed.setTitle(feedTitle)
    feed.setDescription(
      description.getOrElse("Latest news and features from theguardian.com, the world's leading liberal voice"),
    )
    feed.setLink("https://www.theguardian.com" + url.getOrElse(""))
    feed.setLanguage("en-gb")
    feed.setCopyright(
      s"Guardian News &amp; Media Limited or its affiliated companies. All rights reserved. ${RssDates
        .getYear(new Date())}",
    )
    feed.setImage(image)
    feed.setPublishedDate(new Date())
    feed.setEncoding("utf-8")

    // Feed: entries
    val entries = content.map { content =>
      val trail = content.trail

      // Entry: categories
      val categories = trail.tags.keywords.map { tag =>
        val category = new SyndCategoryImpl
        category.setName(tag.name)
        category.setTaxonomyUri(tag.metadata.webUrl)
        category
      }.asJava

      // Entry: description
      val standfirst = trail.fields.standfirst.getOrElse("")
      val intro = introFromContent(content)
      val description = makeEntryDescriptionUsing(standfirst, intro, trail.metadata.webUrl)

      val mediaModules: Seq[MediaEntryModuleImpl] = for {
        profile: ImageProfile <- List(Item140, Item460)
        trailPicture: ImageMedia <- trail.trailPicture
        trailAsset: ImageAsset <- profile.bestFor(trailPicture)
        resizedImage <- profile.bestSrcFor(trailPicture)
      } yield {
        // create media
        val media = new MediaContent(new UrlReference(resizedImage))
        profile.width.foreach(media.setWidth(_))
        profile.height.foreach(media.setHeight(_))
        trailAsset.mimeType.foreach(media.setType)
        // create image's metadata
        val imageMetadata = new Metadata()
        trailAsset.caption.foreach({ d => imageMetadata.setDescription(stripInvalidXMLCharacters(d)) })
        trailAsset.credit.foreach { creditName =>
          val credit = new Credit(null, null, stripInvalidXMLCharacters(creditName))
          imageMetadata.setCredits(Seq(credit).toArray)
        }
        media.setMetadata(imageMetadata)
        // create image module
        val module = new MediaEntryModuleImpl()
        module.setMediaContents(Seq(media).toArray)
        module
      }

      // Entry: DublinCore
      val dc = new DCModuleImpl
      dc.setDate(trail.webPublicationDate.toDate)
      dc.setCreator(trail.byline.getOrElse("Guardian Staff"))

      // Entry
      val entry = new SyndEntryImpl
      entry.setTitle(stripInvalidXMLCharacters(trail.fields.linkText))
      entry.setLink(trail.metadata.webUrl)
      entry.setDescription(description)
      entry.setCategories(categories)
      entry.setModules(new java.util.ArrayList((mediaModules ++ Seq(dc)).asJava))
      entry

    }.asJava

    feed.setEntries(entries)

    val writer = new StringWriter()
    val output = new SyndFeedOutput()
    output.output(feed, writer)
    writer.close()
    writer.toString
  }

  def fromPressedPage(pressedPage: PressedPage)(implicit request: RequestHeader): String = {
    val faciaContentList: List[PressedStory] =
      pressedPage.collections
        .filterNot(_.config.excludeFromRss)
        .flatMap(_.curatedPlusBackfillDeduplicated)
        .filter {
          case _: LinkSnap => false
          case _           => true
        }
        .filter(_.properties.maybeContentId.isDefined)
        .distinctBy(faciaContent => faciaContent.properties.maybeContentId.getOrElse(faciaContent.card.id))
        .flatMap(_.properties.maybeContent)

    val webTitle = if (pressedPage.metadata.contentType.contains(DotcomContentType.NetworkFront)) {
      "The Guardian"
    } else {
      s"${pressedPage.metadata.webTitle} | The Guardian"
    }

    fromFaciaContent(webTitle, faciaContentList, pressedPage.metadata.url, pressedPage.metadata.description)
  }

  def fromFaciaContent(
      webTitle: String,
      faciaContentList: Seq[PressedStory],
      url: String,
      description: Option[String] = None,
  )(implicit request: RequestHeader): String = {

    // Feed
    val feed = new SyndFeedImpl
    feed.setFeedType("rss_2.0")
    feed.setTitle(webTitle)
    feed.setDescription(
      description.getOrElse("Latest news and features from theguardian.com, the world's leading liberal voice"),
    )
    feed.setLink("https://www.theguardian.com" + url)
    feed.setLanguage("en-gb")
    feed.setCopyright(
      s"Guardian News and Media Limited or its affiliated companies. All rights reserved. ${RssDates.getYear(new Date())}",
    )
    feed.setImage(image)
    feed.setPublishedDate(new Date())
    feed.setEncoding("utf-8")

    // Feed: entries
    val entries = faciaContentList.map { faciaContent =>
      // Entry: categories
      val categories = faciaContent.tags.keywords.map { tag =>
        val category = new SyndCategoryImpl
        category.setName(tag.name)
        category.setTaxonomyUri(tag.metadata.webUrl)
        category
      }.asJava

      // Entry: description
      val standfirst = faciaContent.fields.standfirst.getOrElse("")
      val intro = faciaContent.fields.body
      val webUrl = faciaContent.metadata.webUrl
      val description = makeEntryDescriptionUsing(standfirst, intro, webUrl)

      val mediaModules: Seq[MediaEntryModuleImpl] = for {
        profile: ImageProfile <- List(Item140, Item460)
        trailPicture: ImageMedia <- faciaContent.trail.trailPicture
        trailAsset: ImageAsset <- profile.bestFor(trailPicture)
        resizedImage <- profile.bestSrcFor(trailPicture)
      } yield {
        // create image
        val media = new MediaContent(new UrlReference(resizedImage))
        profile.width.foreach(media.setWidth(_))
        profile.height.foreach(media.setHeight(_))
        trailAsset.mimeType.foreach(media.setType)
        // create image's metadata
        val imageMetadata = new Metadata()
        trailAsset.caption.foreach({ d => imageMetadata.setDescription(stripInvalidXMLCharacters(d)) })
        trailAsset.credit.foreach { creditName =>
          val credit = new Credit(null, null, creditName)
          imageMetadata.setCredits(Seq(credit).toArray)
        }
        media.setMetadata(imageMetadata)
        // create image module
        val module = new MediaEntryModuleImpl()
        module.setMediaContents(Seq(media).toArray)
        module
      }

      // Entry: DublinCore
      val dc = new DCModuleImpl
      dc.setDate(faciaContent.trail.webPublicationDate.toDate)
      dc.setCreator(faciaContent.trail.byline.getOrElse("Guardian Staff"))

      // Entry
      val entryWebTitle = faciaContent.metadata.webTitle
      val entry = new SyndEntryImpl
      entry.setTitle(stripInvalidXMLCharacters(entryWebTitle))
      entry.setLink(webUrl)
      entry.setDescription(description)
      entry.setCategories(categories)
      entry.setModules(new java.util.ArrayList((mediaModules ++ Seq(dc)).asJava))
      entry

    }.asJava

    feed.setEntries(entries)

    val writer = new StringWriter()
    val output = new SyndFeedOutput()
    output.output(feed, writer)
    writer.close()
    writer.toString
  }

  def introFromContent(content: Content): String = {
    content.fields.blocks
      .map { blocks: Blocks =>
        // Collect html from the body block text elements who have an html snippet to offer
        // Then take the first 2 of them
        val bodyBlocks = blocks.requestedBodyBlocks.getOrElse("body:oldest:10", Seq.empty)
        val elementHtml = bodyBlocks
          .flatMap { bodyBlock =>
            bodyBlock.elements
          }
          .flatMap {
            case TextBlockElement(html) => html
            case _                      => None
          }
          .take(2)

        // Then apply the long standing paragraph extraction as text elements can contain more than 1 paragraph
        val sumOfFirstTextElements = elementHtml.mkString
        Jsoup.parseBodyFragment(sumOfFirstTextElements).select("p:lt(2)").toArray.map(_.toString).mkString("")
      }
      .getOrElse("")
  }

  private def makeEntryDescriptionUsing(standfirst: String, intro: String, webUrl: String): SyndContentImpl = {
    val descriptionComponents =
      Seq(standfirst, intro, s""" <a href="$webUrl">Continue reading...</a>""").filter(_.size < 5000)

    val description = new SyndContentImpl
    description.setValue(stripInvalidXMLCharacters(descriptionComponents.mkString))
    description
  }

}
