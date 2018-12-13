package views.support.cleaner

import common.Edition
import conf.Configuration.commercial.prebidServerUrl
import conf.Configuration.environment
import model.Article
import org.jsoup.nodes.{Document, Element}
import views.support.{AdRegion, AmpAd, AmpAdDataSlot, AmpAdRtcConfig, AuAdRegion, HtmlCleaner, RowAdRegion, UsAdRegion}

import scala.collection.JavaConverters._
import scala.xml.Elem

object AmpAdCleaner {
  val AD_LIMIT = 8
  val CHARS_BETWEEN_ADS = 700
  val DONT_INTERLEAVE_SMALL_PARA = 50

  def findElementsNeedingAdsAfter(children: List[Element]): List[Element] = {

    val ALLOWED = 0
    val DISALLOWED = 1

    // create the constraints for each paragraph how far before and after we can have it
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

  def adAfter(element: Element): Element = {
    def ampAd(adRegion: AdRegion): Elem =
      <amp-ad
      class={s"geo-amp-ad geo-amp-ad--${adRegion.cssClassSuffix}"}
      data-npa-on-unknown-consent="true"
      layout="responsive"
      width="300" height="250"
      type="doubleclick"
      data-loading-strategy="prefer-viewability-over-views"
      json={AmpAd(article, uri, edition.id.toLowerCase()).toString()}
      data-slot={AmpAdDataSlot(article).toString()}
      rtc-config={AmpAdRtcConfig.toJsonString(
        prebidServerUrl,
        adRegion,
        debug = environment.isNonProd
      )}></amp-ad>

    val ampAdString = {
      // data-block-on-consent should not have ANY value
      // according to https://www.ampproject.org/docs/reference/components/amp-consent
      // This is not compatible with proper XML, hence the stringware hack

      // This cannot be activated until we designed a solution to either inject/synchronise consent from our storage
      // or gather it in AMP.
      // ( ampAd % Attribute(null, "data-block-on-consent", "PLEASEREMOVEME", Null) ).toString().replaceFirst("=\"PLEASEREMOVEME\"", "")
      // Falling back to
      val usAdRegionSlot = ampAd(UsAdRegion).toString()
      val auAdRegionSlot = ampAd(AuAdRegion).toString()
      val rowAdRegionSlot = ampAd(RowAdRegion).toString()
      s"$usAdRegionSlot$auAdRegionSlot$rowAdRegionSlot"
    }

    element.after( "<div class=\"amp-ad-container\">" ++ ampAdString ++ "</div>" )
  }

  override def clean(document: Document): Document = {
    val children = document.body().children().asScala.toList
    val adsAfterAndEnd = AmpAdCleaner.findElementsNeedingAdsAfter(children)
    adsAfterAndEnd.foreach(adAfter) // side effects =(
    document
  }
}
