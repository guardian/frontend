package common 

import model.Trail
import views.support.{ImgSrc, cleanTrailText}

object TrailsToRss { 
  
  // FIXME - not sure if we need the request header here - def apply(trail: Trail)(implicit request: RequestHeader) : JsValue = {
  
  def apply(trails: List[Trail]) = {

    import com.sun.syndication.feed.synd._;
    import com.sun.syndication.io.{FeedException, SyndFeedOutput}
    import java.io.IOException;
    import java.io.StringWriter;
    
    val feed = new SyndFeedImpl();
    feed.setFeedType("rss_2.0");
    feed.setTitle("rss_2.0");
    feed.setDescription("...");
    feed.setLink("...");
  
    // for each trail generate a RSS block

    val writer = new StringWriter();
    val output = new SyndFeedOutput()
    output.output(feed, writer);
    writer.close
    writer.toString
  
  }

}
