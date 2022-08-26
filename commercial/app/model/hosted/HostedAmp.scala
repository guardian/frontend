package model.hosted

import org.jsoup.Jsoup
import org.jsoup.nodes.Element

import scala.jdk.CollectionConverters._

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

    def transformVideos(): Unit = {
      def transformVideo(video: Element): Element =
        video.tagName("amp-video").attr("layout", "responsive").attr("width", "16").attr("height", "9")
      val figures = doc.select("figure:has(gu-atom)")
      for (
        figure <- figures.asScala;
        video <- figure.select("video").asScala
      ) {

        figure.appendChild(transformVideo(video))
        figure.select("gu-atom").remove()
      }
    }

    def removeAtoms(): Unit = {
      val atoms = doc.select("figure:has(gu-atom)")
      atoms.remove()
    }

    transformImages()
    transformVideos()
    removeAtoms()

    doc.body.html()
  }
}
