package views.support.cleaner.amp_embed_cleaner.amp_embed_types

import views.support.cleaner.amp_embed_cleaner.MatchableAmpEmbed
import org.jsoup.nodes.{Document, Element}
import scala.collection.JavaConversions._
import scala.util.matching.Regex
/**
* Created by mmcnamara on 18/04/2017.
*/
case class AmpComments(document: Document, figure: Element) extends MatchableAmpEmbed("figure", "data-canonical-url") {
 override val urlPattern: Regex = "https://discussion.theguardian.com/comment-permalink/(\\d+)".r
 override def getMatchingUrl(): String = { figure.attr("data-canonical-url")}
 override def returnAmpEmbed(): Element = {
   val comment = figure.clone()
   comment.getElementsByTag("img").foreach { image: Element =>
     val validImage = image.hasAttr("class") && image.attr("class").contains("d2-avatar") && image.hasAttr("src") && image.hasAttr("height") && image.hasAttr("width") && image.hasAttr("alt")
     if (validImage) {
       val ampImg = document.createElement("amp-img")
       val attrs = Map(
         "class" -> ("d2-avatar-image " + image.attr("class")),
         "src" -> image.attr("src"),
         "height" -> image.attr("height"),
         "width" -> image.attr("width"),
         "alt" -> image.attr("alt"),
         "layout" -> "fixed")
       attrs.foreach {
         case (key, value) => ampImg.attr(key, value)
       }
       image.replaceWith(ampImg)
     } else {
       image.remove()
     }
   }
   comment
  }
}
