package common 

import model.Trail
import views.support.{ImgSrc, cleanTrailText}
import play.api.mvc.RequestHeader
import scala.collection.JavaConverters._
import org.joda.time.DateTime

object TrailsToRss { 
  def apply(title: Option[String], trails: Seq[Trail])(implicit request: RequestHeader): String = {

    import com.sun.syndication.feed.synd._
    import com.sun.syndication.io.{FeedException, SyndFeedOutput}
   
    val feedTitle = s"${title.getOrElse("")} | theguardian.com"

    // Feed: image
    val image = new SyndImageImpl
    image.setLink("http://www.theguardian.com")
    image.setUrl("http://assets.guim.co.uk/images/guardian-logo-rss.8738b8e596be8126a767fdf608b696c8.png")
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
      description.setValue(trail.trailText.map{ text =>
        cleanTrailText(text)(Edition(request)).toString()
      }.getOrElse(""))
      
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
    
    import java.io.StringWriter

    val writer = new StringWriter()
    val output = new SyndFeedOutput()
    output.output(feed, writer)
    writer.close
    writer.toString
  }
}
