package common 

import model.Trail
import views.support.{ImgSrc, cleanTrailText}
import play.api.mvc.RequestHeader
import scala.collection.JavaConverters._

object TrailsToRss { 
  def apply(title: String, trails: Seq[Trail])(implicit request: RequestHeader): String = {

    import com.sun.syndication.feed.synd._
    import com.sun.syndication.io.{FeedException, SyndFeedOutput}
    import java.io.IOException
    import java.io.StringWriter
    
    val feed = new SyndFeedImpl()
    feed.setFeedType("rss_2.0")
    feed.setTitle(s"${title} | theguardian.com")
    feed.setDescription("....")
    feed.setLink(trails.size.toString)
    
    val entries = trails.map{ trail => 
      val entry = new SyndEntryImpl
      //entry.setTitle(trail.headline)
      entry.setTitle(trail.headline)
      entry.setLink(trail.url)
      val description = new SyndContentImpl
      description.setValue(trail.trailText.map{ text =>
          cleanTrailText(text)(Edition(request)).toString()
        }.getOrElse(""))
      description.setType("text")
      entry.setDescription(description)
      entry.setAuthor(trail.byline.getOrElse(""))
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
