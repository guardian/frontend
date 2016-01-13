package views.support.cleaner

import common.Edition
import model.{Tag, Article}
import org.jsoup.nodes.{Document, Element}
import play.api.libs.json.Json
import views.support.HtmlCleaner

import scala.collection.JavaConversions._

object AmpAdCleaner {
  val AD_LIMIT = 2
  val CHARS_BETWEEN_ADS = 700
  val DONT_INTERLEAVE_SMALL_PARA = 50

  def findElementsNeedingAdsAfter(children: List[Element]): List[Element] = {

    val ALLOWED = 0
    val DISALLOWED = 1

    // create the contstraints for each paragraph how far before and after we can have it
    val constraints = children.map { element =>

      def para = element.tagName() != "p"
      def short = element.text().length < DONT_INTERLEAVE_SMALL_PARA

      if (para) {
        // don't put an ad before or too close after an embed
        AdRepel(300, 200, element)
      } else if (short) {
        // don't interleave ads between small paragraphs
        AdRepel(DISALLOWED, DISALLOWED, element)
      } else {
        AdRepel(ALLOWED, ALLOWED, element)
      }
    }

    // propagate the constraints across the paragraphs forwards and then backwards
    val propagatedConstraints = constraints.foldLeft((Nil: List[AdRepel], CHARS_BETWEEN_ADS)){ case ((accu, charsTilAd), currentElement) =>

      val newCharsTilAd = charsTilAd - currentElement.length
      def carryForwardRepel = currentElement.after < newCharsTilAd

      if (carryForwardRepel) {
        (currentElement.copy(after = newCharsTilAd) :: accu, newCharsTilAd)
      } else {
        (currentElement :: accu, currentElement.after)
      }

    }._1.foldLeft((Nil: List[AdRepel], 0)){ case ((accu, charsTilAd), currentElement) =>

      val newCharsTilAd = charsTilAd - currentElement.length
      def carryBackwardRepel = currentElement.before < newCharsTilAd

      if (carryBackwardRepel) {
        (currentElement.copy(before = newCharsTilAd) :: accu, newCharsTilAd)
      } else {
        (currentElement :: accu, currentElement.before)
      }

    }._1

    // now if the repel forward and backward is zero (or less) then we can put in an ad
    Some(propagatedConstraints).filter(_.length > 1).map {
      _.sliding(2).foldLeft((Nil: List[Element], 0)){
        case ((accu, charsTilAd), List(firstElement, secondElement)) =>

          if (accu.length < AD_LIMIT && charsTilAd <= 0 && firstElement.after <= 0 && secondElement.before <= 0) {
            (firstElement.element :: accu, CHARS_BETWEEN_ADS)
          } else {
            (accu, charsTilAd - firstElement.length)
          }

      }._1
    }.getOrElse(Nil)

  }

  object AdRepel {
    def apply(before: Int, after: Int, element: Element): AdRepel = {
      AdRepel(before, after, element.text().length, element)
    }
  }
  case class AdRepel(before: Int, after: Int, length: Int, element: Element)

}

case class AmpAdCleaner(edition: Edition, uri: String, article: Article) extends HtmlCleaner {

  private def parseIds(items: Seq[Tag]) = {
    items.map { item =>
      if (item.id == "uk/uk") {
        item.id
      } else {
        val keyword = item.id.split("/").last
        keyword.replaceAll("""/[+s]+/g""", "-").toLowerCase()
      }
    }
  }

  def adAfter(element: Element) = {
    val section = article.metadata.section
    val contentType = article.metadata.contentType.toLowerCase
    val dataSlot = s"/59666047/theguardian.com/$section/$contentType/amp"

    val json = Json.obj(
      "targeting" -> Json.obj(
        "url" -> uri,
        "edition" -> edition.id.toLowerCase(),
        "se" -> parseIds(article.trail.tags.series).mkString(","),
        "ct" -> article.metadata.contentType,
        "p" -> "amp",
        "k" -> parseIds(article.trail.tags.keywords).mkString(","),
        "co" -> parseIds(article.trail.tags.contributors).mkString(","),
        "bl" -> parseIds(article.trail.tags.blogs).mkString(",")
      )
    )

    val ampAd = <div class="amp-ad-container">
          <amp-ad width="300" height="250" type="doubleclick"
                  json={json.toString()}
                  data-slot={dataSlot}>
          </amp-ad>
      </div>

    element.after(ampAd.toString())
  }

  override def clean(document: Document): Document = {
    val children = document.body().children().toList
    val adsAfterAndEnd = AmpAdCleaner.findElementsNeedingAdsAfter(children)
    adsAfterAndEnd.foreach(adAfter) // side effects =(
    document
  }
}
