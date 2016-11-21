package model.hosted

import org.jsoup.Jsoup
import org.jsoup.nodes.Element

import scala.collection.JavaConverters._

object HostedAmp {

  def ampify(html: String): String = {

    val doc = Jsoup.parseBodyFragment(html)

    def transformImages(): Unit = {
      def transformImage(img: Element): Element = img.tagName("amp-img").attr("layout", "responsive")
      val imgs = doc.select("img")
      for (img <- imgs.asScala) {
        transformImage(img)
      }
    }

    def removeAtoms(): Unit = {
      val atoms = doc.select("figure:has(gu-atom)")
      atoms.remove()
    }

    transformImages()
    removeAtoms()

    doc.body.html()
  }
}
