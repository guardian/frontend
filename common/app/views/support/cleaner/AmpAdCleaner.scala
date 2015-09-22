package views.support.cleaner

import org.jsoup.nodes.{Document, Element}
import views.support.HtmlCleaner

import scala.annotation.tailrec
import scala.collection.JavaConversions._

object AmpAdCleaner extends HtmlCleaner {

  val AD_LIMIT = 2
  val CHARS_BETWEEN_ADS = 700
  val DONT_INTERLEAVE_SMALL_PARA = 50

  def adAfter(element: Element) = {
    element.after("""<div class="amp-ad-container"><amp-ad width=300 height=250 type="doubleclick" json='{"targeting":{"sc":["1"]}}' data-slot="/59666047/theguardian.com/uk"></amp-ad></div>""")
  }

  def findElementsNeedingAdsAfter(children: List[Element]): List[Element] = {
    @tailrec
    def rec(charsUntilAd: Int, adsAfter: List[Element], elements: List[Element]): (Int, List[Element]) = {
      elements match {
        case Nil => (charsUntilAd, adsAfter)
        case element :: rest =>
          val paraLength = element.text().length
          if (charsUntilAd - paraLength <= 0 && paraLength > DONT_INTERLEAVE_SMALL_PARA) {
            val newAdsAfter = element :: adsAfter
            if (newAdsAfter.length == AD_LIMIT)
              (-1/*not used*/, newAdsAfter)
            else
              rec(CHARS_BETWEEN_ADS, newAdsAfter, rest)
          } else
            rec(charsUntilAd - paraLength, adsAfter, rest)
      }
    }
    val (charsUntilAd, adsAfter) = rec(CHARS_BETWEEN_ADS, Nil, children)
    if (adsAfter.length < AD_LIMIT && charsUntilAd != CHARS_BETWEEN_ADS)
      children.last :: adsAfter
    else
      adsAfter
  }

  override def clean(document: Document): Document = {
    val children = document.body().children().toList
    val adsAfterAndEnd = findElementsNeedingAdsAfter(children)
    adsAfterAndEnd.foreach(adAfter) // side effects =(
    document
  }

}
