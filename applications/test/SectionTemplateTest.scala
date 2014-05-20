package test

import org.scalatest.Matchers
import org.scalatest.FlatSpec
import scala.collection.JavaConversions._

class SectionTemplateTest extends FlatSpec with Matchers {

  it should "render front title" in HtmlUnit("/uk-news") { browser =>
    import browser._
    $(".container__title").first.getText should be ("UK news")
  }

  ignore should "Link to an RSS feed" in HtmlUnit("/books") { browser =>
    import browser._
    val front = findFirst("link[type='application/rss+xml']")
    front.getAttribute("href") should be ("/books/rss")
    front.getAttribute("rel") should be ("alternate")
  }
}
