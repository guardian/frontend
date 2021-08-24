package pagepresser

import com.netaporter.uri.Uri._
import org.jsoup.Jsoup
import org.jsoup.nodes.{Element, Document}
import scala.collection.JavaConverters._
import scala.io.Source

object InteractiveImmersiveHtmlCleaner extends HtmlCleaner with implicits.WSRequests {

  override def canClean(document: Document): Boolean = {
    !document.getElementsByClass("is-immersive-interactive").isEmpty() &&
    document.getElementsByAttributeValue("rel", "canonical").attr("href").toLowerCase.contains("/ng-interactive/")
  }

  override def clean(document: Document, convertToHttps: Boolean): Document = {
    println("cleaning interactive immersive")
    universalClean(document)
    removeScripts(document)
    removeByTagName(document, "noscript")
    if (convertToHttps) secureDocument(document)
    document
  }

  override def removeScripts(document: Document): Document = {
    // TODO: decide how to handle scripts
    document
  }

}
