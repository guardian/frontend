package views.support.cleaner

import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import org.scalatest.{FlatSpec, Matchers}

class AmpAdCleanerTest extends FlatSpec with Matchers {

  val tenChars = "qwertyasdf"

   "AmpAdCleaner" should "add an advert after 700 chars as well as the end one" in {
     val doc = s"""<html><body><p>${tenChars * 70}</p><p>${tenChars * 70}</p></body></html>"""
     val document: Document = Jsoup.parse(doc)
     val result: Document = AmpAdCleaner.clean(document)

     result.getElementsByTag("amp-ad").size should be(2)

   }

  "AmpAdCleaner" should "not add an advert after 699 chars" in {
    val doc = s"""<html><body><p>${tenChars * 69}asdfqwert</p><p>${tenChars * 70}</p></body></html>"""
    val document: Document = Jsoup.parse(doc)
    val result: Document = AmpAdCleaner.clean(document)

    result.getElementsByTag("amp-ad").size.should(be(1))

  }

  "AmpAdCleaner" should "only add 2 ads in total" in {
    val doc = s"""<html><body>${s"<p>${tenChars * 70}</p>" * 3}</body></html>"""
    val document: Document = Jsoup.parse(doc)
    val result: Document = AmpAdCleaner.clean(document)

    result.getElementsByTag("amp-ad").size should be(2)

  }

  "AmpAdCleaner" should "not break up small paragraphs with ads" in {
    val doc = s"""<html><body>${s"<p>${tenChars}</p>" * (70 * 10)}</body></html>"""
    val document: Document = Jsoup.parse(doc)
    val result: Document = AmpAdCleaner.clean(document)

    result.getElementsByTag("amp-ad").size should be(1)

  }

 }
