package views.support

import org.jsoup.nodes.{Element, Document}
import scala.jdk.CollectionConverters._

object WitnessCleaner extends HtmlCleaner {
  override def clean(document: Document): Document = {

    document.getElementsByClass("element-witness-video").asScala.foreach { embed: Element =>
      //remove height from video iframe
      embed.getElementsByClass("element-witness--main").asScala.foreach { main =>
        main.getElementsByTag("iframe").asScala.foreach(_.attr("height", ""))
      }
    }

    document.getElementsByClass("element-witness--brand").asScala.foreach { brand: Element =>
      val witnessLogo = document.createElement("span")
      witnessLogo.attr("class", "witness-logo")
      witnessLogo.html("Guardian <span class='witness-logo__witness'>Witness</span>")
      brand.children().asScala.foreach(_.remove)
      brand.text("")
      brand.appendChild(witnessLogo)
    }
    document
  }
}
