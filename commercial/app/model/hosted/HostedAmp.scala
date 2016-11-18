package model.hosted

import org.jsoup.Jsoup
import org.jsoup.nodes.Element

import scala.collection.JavaConverters._

object HostedAmp {

  def ampify(html: String): String = {

    def ampifyImage(img: Element): Element = img.tagName("amp-img").attr("layout", "fixed")

    val doc = Jsoup.parseBodyFragment(html)
    val imgs = doc.select("img")
    for (img <- imgs.asScala) {
      ampifyImage(img)
    }
    doc.body.html()
  }
}
