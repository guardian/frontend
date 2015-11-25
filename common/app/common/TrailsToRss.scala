package common

import java.io.StringWriter

import com.gu.facia.api.models.{FaciaContent, LinkSnap}
import com.sun.syndication.feed.module.DCModuleImpl
import com.sun.syndication.feed.module.mediarss._
import com.sun.syndication.feed.module.mediarss.types.{Credit, MediaContent, Metadata, UrlReference}
import com.sun.syndication.feed.synd._
import com.sun.syndication.io.SyndFeedOutput
import implicits.FaciaContentFrontendHelpers._
import implicits.FaciaContentImplicits._
import model._
import org.joda.time.DateTime
import org.jsoup.Jsoup
import play.api.mvc.RequestHeader

import scala.collection.JavaConversions._
import scala.collection.JavaConverters._

object TrailsToRss extends implicits.Collections {

  def stripInvalidXMLCharacters(s: String) = {
    s.replaceAll("[^\\x09\\x0A\\x0D\\x20-\\uD7FF\\uE000-\\uFFFD\\u10000-\\u10FFFF]", "")
  }

  val image: SyndImageImpl = {
    // Feed: image
    val image = new SyndImageImpl
    image.setLink("http://www.theguardian.com")

    // This image fits this spec. - https://support.google.com/news/publisher/answer/1407682
    image.setUrl("http://assets.guim.co.uk/images/guardian-logo-rss.c45beb1bafa34b347ac333af2e6fe23f.png")
    image.setTitle("The Guardian")
    image
  }

  def apply(metaData: MetaData, trails: Seq[Trail])(implicit request: RequestHeader): String =
    TrailsToRss(Some(metaData.webTitle), trails, Some(metaData.url), metaData.description)

  def apply(title: Option[String], trails: Seq[Trail], url: Option[String] = None, description: Option[String] = None)(implicit request: RequestHeader): String = {
    val feedTitle = title.map(t => s"$t | The Guardian").getOrElse("The Guardian")

    // Feed
    val feed = new SyndFeedImpl
    feed.setFeedType("rss_2.0")
    feed.setTitle(feedTitle)
    feed.setDescription(description.getOrElse("Latest news and features from theguardian.com, the world's leading liberal voice"))
    feed.setLink("http://www.theguardian.com" + url.getOrElse(""))
    feed.setLanguage("en-gb")
    feed.setCopyright(s"Guardian News and Media Limited or its affiliated companies. All rights reserved. ${DateTime.now.getYear}")
    feed.setImage(image)
    feed.setPublishedDate(DateTime.now.toDate)
    feed.setEncoding("utf-8")

    // Feed: entries
    val entries = trails.map{ trail =>
      // Entry: categories
      val categories = trail.keywords.map{ tag =>
        val category = new SyndCategoryImpl
        category.setName(tag.name)
        category.setTaxonomyUri(tag.webUrl)
        category
      }.asJava

      // Entry: description
      val description = new SyndContentImpl
      val standfirst = trail match {
          case c: Content => c.standfirst.getOrElse("")
          case _ => ""
        }
      val intro = trail match {
          case a: Article => Jsoup.parseBodyFragment(a.body).select("p:lt(2)").toArray.map(_.toString).mkString("")
          case _ => ""
        }
      val readMore = s""" <a href="${trail.webUrl}">Continue reading...</a>"""
      description.setValue(stripInvalidXMLCharacters(standfirst + intro + readMore))

      val images: Seq[ImageAsset] = (trail.bodyImages ++ trail.mainPicture ++ trail.thumbnail).flatMap { i =>
        i.imageCrops.filter(c => (c.width == 140 && c.height == 84) || (c.width == 460 && c.height == 276))
      }.distinctBy(_.url)

      val modules: Seq[MediaEntryModuleImpl] = for {
        image <- images
        url <- image.url
      } yield {
        // create media
        val media = new MediaContent(new UrlReference(url.encodeURI))
        media.setHeight(image.height)
        media.setWidth(image.width)
        image.mimeType.foreach(media.setType)
        // create media's metadata
        val imageMetadata = new Metadata()
        image.caption.foreach({ d => imageMetadata.setDescription(stripInvalidXMLCharacters(d)) })
        image.credit.foreach{ creditName =>
          val credit = new Credit(null, null, creditName)
          imageMetadata.setCredits(Seq(credit).toArray)
        }
        media.setMetadata(imageMetadata)
        // create media module
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
      entry.setTitle(stripInvalidXMLCharacters(trail.linkText))
      entry.setLink(trail.webUrl)
      entry.setDescription(description)
      entry.setCategories(categories)
      entry.setModules(new java.util.ArrayList(modules ++ Seq(dc)))
      entry

    }.asJava

    feed.setEntries(entries)

    val writer = new StringWriter()
    val output = new SyndFeedOutput()
    output.output(feed, writer)
    writer.close()
    writer.toString
  }

  def fromPressedPage(pressedPage: PressedPage)(implicit request: RequestHeader) = {
    val faciaContentList: List[FaciaContent] =
      pressedPage.collections
        .filterNot(_.config.excludeFromRss)
        .flatMap(_.curatedPlusBackfillDeduplicated)
        .filter{
          case _: LinkSnap => false
          case _ => true}
        .filter(_.maybeContentId.isDefined)
        .distinctBy(faciaContent => faciaContent.maybeContentId.getOrElse(faciaContent.id))

    fromFaciaContent(pressedPage.webTitle, faciaContentList, pressedPage.url, pressedPage.description)
  }

  def fromFaciaContent(webTitle: String, faciaContentList: Seq[FaciaContent], url: String, description: Option[String] = None)(implicit request: RequestHeader): String  = {
    val feedTitle = s"$webTitle | The Guardian"

    // Feed
    val feed = new SyndFeedImpl
    feed.setFeedType("rss_2.0")
    feed.setTitle(feedTitle)
    feed.setDescription(description.getOrElse("Latest news and features from theguardian.com, the world's leading liberal voice"))
    feed.setLink("http://www.theguardian.com" + url)
    feed.setLanguage("en-gb")
    feed.setCopyright(s"Guardian News and Media Limited or its affiliated companies. All rights reserved. ${DateTime.now.getYear}")
    feed.setImage(image)
    feed.setPublishedDate(DateTime.now.toDate)
    feed.setEncoding("utf-8")

    // Feed: entries
    val entries = faciaContentList.map{ faciaContent =>
      // Entry: categories
      val categories = faciaContent.keywords.map(Tag.apply(_)).map{ tag =>
        val category = new SyndCategoryImpl
        category.setName(tag.name)
        category.setTaxonomyUri(tag.webUrl)
        category
      }.asJava

      // Entry: description
      val description = new SyndContentImpl
      val standfirst = faciaContent.standfirst.getOrElse("")
      val intro = faciaContent
        .body
        .map { b => Jsoup.parseBodyFragment(b).select("p:lt(2)").toArray.map(_.toString).mkString("") }
        .getOrElse("")

      val webUrl = faciaContent.webUrl.getOrElse("http://www.theguardian.com/")
      val readMore = s""" <a href="$webUrl">Continue reading...</a>"""
      description.setValue(stripInvalidXMLCharacters(standfirst + intro + readMore))

      val images: Seq[ImageAsset] = (faciaContent.bodyImages ++ faciaContent.mainPicture ++ faciaContent.thumbnail).flatMap{ i =>
        i.imageCrops.filter(c => c.width == 140 || c.width == 460 )
      }.distinctBy(_.url)

      val modules: Seq[MediaEntryModuleImpl] = for {
        image <- images
        url <- image.url
      } yield {
        // create image
        val media = new MediaContent(new UrlReference(url.encodeURI))
        media.setHeight(image.height)
        media.setWidth(image.width)
        image.mimeType.foreach(media.setType)
        // create image's metadata
        val imageMetadata = new Metadata()
        image.caption.foreach({ d => imageMetadata.setDescription(stripInvalidXMLCharacters(d)) })
        image.credit.foreach { creditName =>
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
      dc.setDate(faciaContent.webPublicationDate.toDate)
      dc.setCreator(faciaContent.byline.getOrElse("Guardian Staff"))

      // Entry
      val entryWebTitle = faciaContent.maybeWebTitle.getOrElse("The Guardian")
      val entry = new SyndEntryImpl
      entry.setTitle(stripInvalidXMLCharacters(entryWebTitle))
      entry.setLink(webUrl)
      entry.setDescription(description)
      entry.setCategories(categories)
      entry.setModules(new java.util.ArrayList(modules ++ Seq(dc)))
      entry

    }.asJava

    feed.setEntries(entries)

    val writer = new StringWriter()
    val output = new SyndFeedOutput()
    output.output(feed, writer)
    writer.close()
    writer.toString
  }
}
