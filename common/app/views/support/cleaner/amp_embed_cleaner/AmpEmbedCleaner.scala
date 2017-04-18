package views.support.cleaner.amp_embed_cleaner

import org.jsoup.nodes.{Document, Element}
import views.support.HtmlCleaner
import views.support.cleaner.amp_embed_cleaner.amp_embed_types._
import model.Article

import scala.collection.JavaConversions._


/**
  * Created by mmcnamara on 18/04/2017.
  */
case class AmpEmbedCleaner(article: Article) extends HtmlCleaner {

  override def clean(document: Document): Document = {
    val documentWithAmpVideos: Document = cleanAmpVideos(document)
    cleanAmpFigureElements(documentWithAmpVideos)
  }

  def cleanAmpFigureElements(document: Document): Document = {
    val newDocument = document
    for (figure <- newDocument.getElementsByTag("figure")) yield {
      val ampElement = getMatchingAmpElement(newDocument, figure)
      ampElement match {
        case Some(element) => figure.replaceWith(element)
        case None => figure.getElementsByTag("iframe").foreach(_.remove())
      }
    }
    newDocument
  }

  def cleanAmpVideos(document: Document): Document = {
    val newDocument: Document = document
    for (video <- newDocument.getElementsByTag("video")) yield {
      val ampVideo = AmpVideoEmbed(document, video, article).returnAmpEmbed()
      video.replaceWith(ampVideo)
    }
    newDocument
  }

  def getMatchingAmpElement(doc: Document, figure: Element): Option[Element] = {
    val elementList = List(AmpGoogleMap(doc, figure),
      AmpSoundCloud(doc, figure),
      AmpAudioBoom(doc, figure),
      AmpInstagram(doc, figure),
      AmpYoutubeExternalVideo(doc, figure),
      AmpVimeoExternalVideo(doc, figure),
      AmpFacebookExternalVideo(doc, figure),
      AmpComments(doc, figure))
    val ampElement = (for (embedType <- elementList if embedType.isAMatch) yield embedType.returnAmpEmbed()).headOption
    if (ampElement.isDefined) {
      ampElement
    } else {
      val elementClass = figure.attr("class").split(" ").find(_.contains("element-"))
      elementClass match {
        case Some("element-audio") => Some(AmpOtherAudio(doc, figure).returnAmpEmbed())
        case Some("element-interactive") => Some(AmpInteractive(doc, figure).returnAmpEmbed())
        case Some("element-map") => Some(AmpOtherMap(doc, figure).returnAmpEmbed())
        case _ => None
      }
    }
  }
}
