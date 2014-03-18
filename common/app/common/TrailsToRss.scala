package common

import model.{Content, Article, Trail}
import views.support.{ImgSrc, cleanTrailText}
import play.api.mvc.RequestHeader
import scala.collection.JavaConverters._
import org.joda.time.DateTime
import java.io.StringWriter
import org.jsoup.Jsoup

object TrailsToRss {
  def apply(title: Option[String], trails: Seq[Trail])(implicit request: RequestHeader): String = {

    import com.sun.syndication.feed.synd._
    import com.sun.syndication.io.{FeedException, SyndFeedOutput}

    val feedTitle = title.map(t => s"$t | The Guardian").getOrElse("The Guardian")

    // Feed: image
    val image = new SyndImageImpl
    image.setLink("http://www.theguardian.com")

    // This image fits this spec. - https://support.google.com/news/publisher/answer/1407682
    image.setUrl("http://assets.guim.co.uk/images/guardian-logo-rss.c45beb1bafa34b347ac333af2e6fe23f.png")
    image.setTitle(feedTitle)

    // Feed
    val feed = new SyndFeedImpl
    feed.setFeedType("rss_2.0")
    feed.setTitle(feedTitle)
    feed.setDescription("Latest news and features from theguardian.com, the world's leading liberal voice")
    feed.setLink("http://www.theguardian.com")
    feed.setLanguage("en-gb")
    feed.setCopyright(s"Guardian News and Media Limited or its affiliated companies. All rights reserved. ${DateTime.now.getYear}.")
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
      description.setValue(standfirst + intro)

      // Entry
      val entry = new SyndEntryImpl
      entry.setTitle(trail.headline)
      entry.setLink(trail.webUrl)
      entry.setDescription(description)
      entry.setAuthor(trail.byline.getOrElse(""))
      entry.setPublishedDate(trail.webPublicationDate.toDate)
      entry.setCategories(categories)
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
