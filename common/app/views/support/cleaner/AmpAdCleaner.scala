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
  val SMALL_PARA_CHARS = 50
  val MIN_CHAR_BUFFER = 700
  val IMG_BUFFER_FWD = 300 // really any non-p element type
  val IMG_BUFFER_BWD = 200

  /**
    * Find ad slots
    *
    * Returns a list of elements *after* which ads should be directly
    * placed.
    *
    * Ads are placed:
    *
    * * sufficiently far from other ads (MIN_CHAR_BUFFER characters away)
    * * sufficiently far from non-text (p) elements (IMG_BUFFER_[FWD|BWD])
    * * non adjacent to small (SMALL_PARA_CHARS) paragraphs
    *
    * These tests apply forwards and backwards, though in the case of
    * non-text buffers, the values differ.
    *
    * Where the above tests are met, we say there is adequate 'buffer'
    * around the ad and it can be placed.
    */
  def findAdSlots(elems: Vector[Element]): List[Element] = {
    def isPara(elem: Element): Boolean = elem.tagName() == "p"
    def suitableAdNeighbour(elem: Element): Boolean = isPara(elem) && elem.text.length > SMALL_PARA_CHARS

    def hasForwardBuffer(elems: Vector[Element], index: Int): Boolean = {
      val enoughCharsFwd = {
        val fwdElems = elems.drop(index + 1)
        val meetsThreshold = fwdElems.takeWhile(_.tagName == "p").map(_.text.length).sum >= IMG_BUFFER_FWD
        meetsThreshold || !fwdElems.exists(_.tagName != "p")
      }

      val neighbourSuitable = elems.lift(index + 1).exists(suitableAdNeighbour)

      enoughCharsFwd && neighbourSuitable
    }

    def hasBackwardBuffer(elems: Vector[Element], index: Int, textSinceLastAd: Int): Boolean = {
      val enoughCharsBwd = {
        val bwdElems = elems.take(index + 1).reverse // include element itself as ad will be placed after
        val meetsThreshold = bwdElems.takeWhile(_.tagName == "p").map(_.text.length).sum >= IMG_BUFFER_BWD
        meetsThreshold || !elems.exists(_.tagName != "p")
      }

      suitableAdNeighbour(elems(index)) && textSinceLastAd >= MIN_CHAR_BUFFER && enoughCharsBwd
    }

    var charsScannedSinceLastAd = 0
    var adSlots = List[Element]()
    var adCount = 0

    elems.zipWithIndex.foreach { case (elem, i) =>
      if (adCount < AD_LIMIT) {
        if (isPara(elem)) {
          charsScannedSinceLastAd += elem.text.length

          if (hasBackwardBuffer(elems, i, charsScannedSinceLastAd) && hasForwardBuffer(elems, i)) {
            adSlots = elem :: adSlots
            charsScannedSinceLastAd = 0 // reset
            adCount += 1
          }
        }
      }
    }

    adSlots
  }
}

case class AmpAdCleaner(edition: Edition, uri: String, article: Article) extends HtmlCleaner {

  def insertAdAfter(element: Element): Element = {
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
    val slots = AmpAdCleaner.findAdSlots(children.toVector)
    slots.foreach(insertAdAfter)
    document
  }
}
