package views.fragments.nav

import model.{SimplePage, MetaData}
import org.jsoup.Jsoup
import org.scalatest.{DoNotDiscover, FlatSpec, Matchers}
import play.api.test.FakeRequest
import test.ConfiguredTestSuite
import scala.collection.JavaConversions._

@DoNotDiscover class NavigationTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  it should "render current section once (UK)" in {

    val page = SimplePage(MetaData.make(id="bla-bla", webTitle="bla-bla", section="football", analyticsName="bla-bla"))

    val tpl = views.html.fragments.nav.navigation(page)(FakeRequest("GET", "/bla-bla"))

    val currentSection = Jsoup.parseBodyFragment(tpl.toString).getElementsByClass("top-navigation__item--current")

    currentSection.length shouldEqual 1

    currentSection.first.
      getElementsByTag("a").first.
      attr("href") should include("/football")
  }

  it should "render current section once (US)" in {

    val page = SimplePage(MetaData.make(id="bla-bla", webTitle="bla-bla", section="football", analyticsName="bla-bla"))

    val tpl = views.html.fragments.nav.navigation(page)(FakeRequest("GET", "/bla-bla?_edition=US"))

    val currentSection = Jsoup.parseBodyFragment(tpl.toString).getElementsByClass("top-navigation__item--current")

    currentSection.length shouldEqual 1

    currentSection.first.
      getElementsByTag("a").first.
      attr("href") should include("/football")
  }
}
