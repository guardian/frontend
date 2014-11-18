package test

import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}

import scala.xml.XML

@DoNotDiscover class TagIndexControllerTest extends FlatSpec with Matchers with ConfiguredTestSuite {
  it should "render RSS pages with a page size of 20" in goTo("/sport/cycling/rss") { browser =>
    /** As of writing, larger page sizes cause Content API performance issues. Do not change this unless you know that
      * that is no longer the case.
      */
    (XML.loadString(browser.pageSource()) \\ "item").size shouldEqual 20
  }
}
