package views.support.cleaner

import org.jsoup.nodes.Element
import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import org.scalatest.{FlatSpec, Matchers}
import scala.collection.JavaConverters._

class AmpAdCleanerTest extends FlatSpec with Matchers {

  val tenChars = "qwertyasdf"

  private def adAfter(element: Element) = {
    element.after("""<div class="amp-ad-container"><amp-ad width=300 height=250 type="doubleclick" json='{"targeting":{"sc":["1"]}}' data-slot="/59666047/theguardian.com/uk"></amp-ad></div>""")
  }

  private def clean(document: Document): Document = {
    val children = document.body().children().asScala.toList
    val adsAfterAndEnd = AmpAdCleaner.findAdSlots(children.toVector)
    adsAfterAndEnd.foreach(adAfter) // side effects =(
    document
  }

   "AmpAdCleaner" should "add an advert after 700 chars" in {
     val doc = s"""<html><body><p>${tenChars * 70}</p><p>${tenChars * 70}</p></body></html>"""
     val document: Document = Jsoup.parse(doc)
     val result: Document = clean(document)

     result.getElementsByTag("amp-ad").size should be(1)

   }

  "AmpAdCleaner" should "not add an advert after 699 chars" in {
    val doc = s"""<html><body><p>${tenChars * 69}asdfqwert</p><p>${tenChars * 70}</p></body></html>"""
    val document: Document = Jsoup.parse(doc)
    val result: Document = clean(document)

    result.getElementsByTag("amp-ad").size.should(be(0))

  }

  "AmpAdCleaner" should "not have changed ad intervals without someone checking the tests are still valid" in {
    AmpAdCleaner.AD_LIMIT should be(8)
    AmpAdCleaner.MIN_CHAR_BUFFER should be(700)
    AmpAdCleaner.SMALL_PARA_CHARS should be(50)

  }

  "AmpAdCleaner" should "only add 8 ads in total" in {
    val doc = s"""<html><body>${s"<p>${tenChars * 70}</p>" * 30}</body></html>"""
    val document: Document = Jsoup.parse(doc)
    val result: Document = clean(document)

    result.getElementsByTag("amp-ad").size should be(8)

  }

  "AmpAdCleaner" should "not break up small paragraphs with ads" in {
    val doc = s"""<html><body>${s"<p>$tenChars</p>" * (70 * 10)}</body></html>"""
    val document: Document = Jsoup.parse(doc)
    val result: Document = clean(document)

    result.getElementsByTag("amp-ad").size should be(0)

  }

  "AmpAdCleaner" should "not put an ad directly before something that isn't a p e.g. an image" in {
    val doc = s"""<html><body><p>${tenChars * 70}</p><p>${tenChars * 29}asdfqwert</p><aside></aside></body></html>"""
    val document: Document = Jsoup.parse(doc)
    val result: Document = clean(document)

    result.getElementsByTag("amp-ad").size should be(0)

  }

  "AmpAdCleaner" should "not put an ad directly after something that isn't a p e.g. an image" in {
    val doc = s"""<html><body><p>${tenChars * 70}</p><aside></aside><p>${tenChars * 19}asdfqwert</p></body></html>"""
    val document: Document = Jsoup.parse(doc)
    val result: Document = clean(document)

    result.getElementsByTag("amp-ad").size should be(0)

  }

  "AmpAdCleaner" should "put an ad far enough after something that isn't a p e.g. an image" in {
    val doc = s"""<html><body><p>${tenChars * 70}</p><aside></aside><p>${tenChars * 20}</p><p>${tenChars * 20}</p></body></html>"""
    val document: Document = Jsoup.parse(doc)
    val result: Document = clean(document)

    result.getElementsByTag("amp-ad").size should be(1)

  }

}
