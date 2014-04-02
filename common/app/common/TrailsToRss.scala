package common

import model._
import play.api.mvc.RequestHeader
import org.joda.time.DateTime
import java.io.StringWriter
import org.jsoup.Jsoup
import com.sun.syndication.feed.synd._
import com.sun.syndication.feed.module.{DCModuleImpl}
import com.sun.syndication.feed.module.mediarss._
import com.sun.syndication.feed.module.mediarss.types.{Credit, Metadata, UrlReference, MediaContent}
import com.sun.syndication.io.SyndFeedOutput
import scala.collection.JavaConverters._
import collection.JavaConversions._

object TrailsToRss extends implicits.Collections {

  def apply(metaData: MetaData, trails: Seq[Trail])(implicit request: RequestHeader): String =
    TrailsToRss(Some(metaData.webTitle), trails, Some(metaData.url), metaData.description)

  def apply(title: Option[String], trails: Seq[Trail], url: Option[String] = None, description: Option[String] = None)(implicit request: RequestHeader): String = {

    // http://stackoverflow.com/questions/9710185/how-to-deal-with-invalid-characters-in-a-ws-output-when-using-cxf
    // subjects … Philip Hoare
    def cleanInvalidXmlChars(text: String): String = {
      val re = "[^\\x09\\x0A\\x0D\\x20-\\xD7FF\\xE000-\\xFFFD\\x10000-x10FFFF]".r;
      re.replaceAllIn(text, "")
    }

    val feedTitle = title.map(t => s"$t | The Guardian").getOrElse("The Guardian")

    // Feed: image
    val image = new SyndImageImpl
    image.setLink("http://www.theguardian.com")

    // This image fits this spec. - https://support.google.com/news/publisher/answer/1407682
    image.setUrl("http://assets.guim.co.uk/images/guardian-logo-rss.c45beb1bafa34b347ac333af2e6fe23f.png")
    image.setTitle("The Guardian")

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
      description.setValue(cleanInvalidXmlChars(standfirst + intro))

      val images: Seq[ImageAsset] = (trail.bodyImages ++ trail.mainPicture ++ trail.thumbnail).map{ i =>
        i.imageCrops.filter(c => (c.width == 140 && c.height == 84) || (c.width == 460 && c.height == 276))
      }.flatten.toSeq.distinctBy(_.url)

      val modules: Seq[MediaEntryModuleImpl] = images.filter(_.url.nonEmpty).map { i =>
        // create image
        val image = new MediaContent(new UrlReference(i.url.get))
        image.setHeight(i.height)
        image.setWidth(i.width)
        i.mimeType.map(image.setType)
        // create image's metadata
        val imageMetadata = new Metadata()
        i.caption.map(d => { imageMetadata.setDescription(cleanInvalidXmlChars(d)) })
        i.credit.map{ creditName =>
          val credit = new Credit(null, null, cleanInvalidXmlChars(creditName))
          imageMetadata.setCredits(Seq(credit).toArray)
        }
        image.setMetadata(imageMetadata)
        // create image module
        val module = new MediaEntryModuleImpl()
        module.setMediaContents(Seq(image).toArray)
        module
      }

      // Entry: DublinCore 
      val dc = new DCModuleImpl
      dc.setDate(trail.webPublicationDate.toDate);

      // Entry
      val entry = new SyndEntryImpl
      entry.setTitle(cleanInvalidXmlChars(trail.linkText))
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
    writer.close
    writer.toString
  }
}
