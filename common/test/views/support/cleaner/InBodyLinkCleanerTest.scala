package views.support.cleaner

import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import org.scalatest.{FlatSpec, Matchers}

class InBodyLinkCleanerTest extends FlatSpec with Matchers {

   "UrlParser" should "not return an internal root" in {
     val result: Option[String] = UrlParser.externalDomain("http://www.cheese.com", "http://www.cheese.com")

     result should be(None)

   }

  "UrlParser" should "not return an internal qualified link" in {
    val result: Option[String] = UrlParser.externalDomain("http://www.cheese.com/blah/whatever", "http://www.cheese.com")

    result should be(None)

  }

  "UrlParser" should "not return an internal unqualified link" in {
    val result: Option[String] = UrlParser.externalDomain("/another/article", "http://www.cheese.com")

    result should be(None)

  }

  "UrlParser" should "not return an internal protocol relative" in {
    val result: Option[String] = UrlParser.externalDomain("//www.cheese.com/blah/whatever", "http://www.cheese.com")

    result should be(None)

  }

  "UrlParser" should "notice an external domain" in {
    val result: Option[String] = UrlParser.externalDomain("http://telegraph.co.uk", "http://www.cheese.com")

    result should be(Some("telegraph.co.uk"))

  }

  "UrlParser" should "return an external qualified link" in {
    val result: Option[String] = UrlParser.externalDomain("http://telegraph.co.uk/blah/whatever", "http://www.cheese.com")

    result should be(Some("telegraph.co.uk"))

  }

  "UrlParser" should "return an external protocol relative" in {
    val result: Option[String] = UrlParser.externalDomain("//telegraph.co.uk/blah/whatever", "http://www.cheese.com")

    result should be(Some("telegraph.co.uk"))

  }

  "UrlParser" should "strip www from an external link" in {
    val result: Option[String] = UrlParser.externalDomain("http://www.telegraph.co.uk/blah/whatever", "http://www.cheese.com")

    result should be(Some("telegraph.co.uk"))

  }

}
