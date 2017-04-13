package views.support.cleaner

//import java.net.URLDecoder


import model.{Article, VideoAsset}
import org.jsoup.nodes.{Document, Element}
import views.support.{AmpSrcCleaner, HtmlCleaner}
//import views.support.cleaner.AmpElement

import scala.collection.JavaConversions._
//import scala.util.matching.Regex

case class AmpEmbedCleaner(article: Article) extends HtmlCleaner {

  override def clean(document: Document): Document = {
    val documentWithAmpVideos: Document = cleanAmpVideos(document)
    cleanAmpFigureElements(documentWithAmpVideos)
  }

  def cleanAmpFigureElements(document: Document): Document = {
    val doc = document
    for (figure <- doc.getElementsByTag("figure")) yield {
      val ampElement = getMatchingAmpElement(doc, figure)
      ampElement match {
        case Some(element) => figure.replaceWith(element)
        case None => {
          val elementClass = figure.attr("class").split(" ").find(_.contains("element-"))
          elementClass match {
            case Some("element-audio") => figure.replaceWith(AmpOtherAudio(doc, figure).returnAmpEmbed())
            case Some("element-interactive") => figure.replaceWith(AmpInteractive(doc, figure).returnAmpEmbed())
            case Some("element-map") => figure.replaceWith(AmpOtherMap(doc, figure).returnAmpEmbed())
            case _ => figure.getElementsByTag("iframe").foreach(_.remove())
          }
        }
      }
    }
    doc
  }

  def cleanAmpVideos(document: Document): Document = {
    val newDocument: Document = document
    for (video <- newDocument.getElementsByTag("video")) yield {
      val ampVideo = AmpVideoElement(document, video, article).returnAmpEmbed()
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
    (for (embedType <- elementList if embedType.isAMatch) yield embedType.returnAmpEmbed()).headOption
  }
}


