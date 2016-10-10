package views.support.cleaner

import java.net.URL

import model.Article
import model.content.MediaAtom
import org.jsoup.nodes.Document
import org.jsoup.select.Elements
import views.support.HtmlCleaner



case class YouTubeAtomCleaner(article: Article) extends HtmlCleaner {

  case class ElementsWithYouTubeId(element: Elements, youTubeId: String)

  val youTubeAtoms = article.content.media.filter(_.assets.head.platform == "Youtube")

  def buildEnhancedYouTubeIframe(atomElements: Seq[(ElementsWithYouTubeId)]) : Unit = {
    for(ae <- atomElements){
      val ytIframe = ae.element.select("iframe")
      ytIframe.attr("id", s"youtube-${ae.youTubeId}")
      ytIframe.attr("src", youTubeUrl(ae.youTubeId).toString)
    }
  }



  def youTubeUrl(id: String): URL = {
    val origin = if (!conf.Configuration.site.host.isEmpty) "&origin="+conf.Configuration.site.host else ""

    new URL(s"https://www.youtube.com/embed/$id?modestbranding=1&enablejsapi=1&rel=0&showinfo=0" + origin)
  }




  override def clean(document: Document): Document = {

    def findYouTubeAtomElementsWithId(atoms: Seq[MediaAtom]): Seq[(ElementsWithYouTubeId)] = {
      for (yta <- atoms)
        yield ElementsWithYouTubeId(element = document.getElementsByAttributeValue("data-atom-id", yta.id), youTubeId = yta.assets.head.id)
    }

    buildEnhancedYouTubeIframe(findYouTubeAtomElementsWithId(youTubeAtoms))

    document
  }
}
