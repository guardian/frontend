package views.support.cleaner.amp_embed_cleaner.amp_embed_types


import model.{Article, VideoAsset}
import views.support.{AmpSrcCleaner, HtmlCleaner}
import org.jsoup.nodes.{Document, Element}
import views.support.cleaner.amp_embed_cleaner.AmpEmbed

/**
* Created by mmcnamara on 18/04/2017.
*/
case class AmpVideoEmbed(document: Document, videoElement: Element, article: Article) extends AmpEmbed {
  override def returnAmpEmbed(): Element = {
    val video = document.createElement("amp-video")
    val posterSrc = videoElement.attr("poster")
    val mediaId = videoElement.attr("data-media-id")
    val newPosterSrc = AmpSrcCleaner(posterSrc).toString
    val fallback = "<div fallback > Sorry, your browser is unable to play this video.<br/> Please <a href='http://whatbrowser.org/'>upgrade</a> to a modern browser and try again.</div>"
    video.tagName("amp-video")
    video.removeAttr("data-media-id")
    video.getElementsByTag("source").remove()
    video.append(fallback)
    video.attr("poster", newPosterSrc)
    // Need to hard code aspect ratio 5:3 for Amp pages.
    video.attr("width", "5")
    video.attr("height", "3")
    // Layout responsive keeps the aspect ratio, but ignores the height and width attributes above
    video.attr("layout", "responsive")
    video.attr("controls", "")
    val sourceHTML: String = getVideoAssets(mediaId).map { videoAsset =>
      videoAsset.encoding.map { encoding =>
        if (encoding.url.startsWith("https")) {
          s"""<source src="${encoding.url}" type="${encoding.format}"></source>"""
        }
      }.getOrElse("")
    }.mkString("")
    video.append(sourceHTML)
  }
  private def getVideoAssets(id:String): Seq[VideoAsset] = article.elements.bodyVideos.filter(_.properties.id == id).flatMap(_.videos.videoAssets)
}
