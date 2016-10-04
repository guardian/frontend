package views.support.cleaner

import java.net.URL

import model.Article
import model.content.MediaAtom
import org.jsoup.nodes.Document
import org.jsoup.select.Elements
import views.support.HtmlCleaner



case class YouTubeAtomCleaner(article: Article) extends HtmlCleaner {

  val youTubeAtoms = article.content.media.filter(_.assets.head.platform == "Youtube")

  def youTubeUrl(id: String): URL = {
    val origin = if (!conf.Configuration.site.host.isEmpty) "&origin="+conf.Configuration.site.host else ""

    new URL(s"https://www.youtube.com/embed/$id?modestbranding=1&enablejsapi=1&rel=0&showinfo=0" + origin)
  }

  def buildEnhancedYouTubeIframe(atomElements: Seq[(Elements, String)]) : Unit = {
    for(ae <- atomElements){
      val ytIframe = ae._1.select("iframe")
      ytIframe.attr("id", s"youtube-${ae._2}")
      ytIframe.attr("src", youTubeUrl(ae._2).toString)
    }
  }


  override def clean(document: Document): Document = {

    def findYouTubeAtomElementsWithId(atoms: Seq[MediaAtom]): Seq[(Elements, String)] = {
      for (yta <- atoms)
        yield (document.getElementsByAttributeValue("data-atom-id", yta.id), yta.assets.head.id)
    }

    buildEnhancedYouTubeIframe(findYouTubeAtomElementsWithId(youTubeAtoms))

    document
  }
}
