package integration

import driver.SauceLabsWebDriver
import org.openqa.selenium.WebDriver
import org.openqa.selenium.chrome.ChromeDriver
import org.scalatest._
import org.scalatest.selenium.{Driver, WebBrowser}
import org.scalatest.time.{Seconds, Span}

class AdsTest
  extends FlatSpec
  with Matchers
  with OptionValues
  with BeforeAndAfterAll
  with WebBrowser
  with Driver {

  override implicit val webDriver: WebDriver = {
    lazy val localWebDriver = new ChromeDriver()
    if (Config.remoteMode) SauceLabsWebDriver() else localWebDriver
  }

  implicitlyWait(Span(20, Seconds))

  private def url(path: String): String = {
    s"${Config.baseUrl}/$path?test=test#gu.prefs.switchOn=adverts"
  }

  private def findComponent(path: String, selector: String): Option[Element] = {
    go to url(path)
    find(cssSelector(selector))
  }

  private def findLogo(path: String, domSlotId: String): Option[Element] = {
    findComponent(path, s"#$domSlotId > div > a > img")
  }

  private def shouldBeVisible(maybeComponent: => Option[Element]): Unit = {
    withClue(s"Page source: $pageSource") {
      maybeComponent.value shouldBe 'displayed
    }
  }

  override protected def afterAll(): Unit = quit()

  "Ads" should "display on the sport front" in {

    go to url("uk/sport")

    withClue("Should display top banner ad") {
      shouldBeVisible(find(cssSelector("#dfp-ad--top-above-nav > *")))
      }

    withClue("Should display two MPUs") {
      shouldBeVisible(find(cssSelector("#dfp-ad--inline1 > *")))
      shouldBeVisible(find(cssSelector("#dfp-ad--inline2 > *")))
    }
  }

  "A logo" should "appear on a sponsored front" in {
    shouldBeVisible {
      findLogo(
        path = "voluntary-sector-network/series/the-not-for-profit-debates",
        domSlotId = "dfp-ad--spbadge1"
      )
    }
  }

  it should "appear on a sponsored article" in {
    shouldBeVisible {
      findLogo(
        path = "voluntary-sector-network/2015/apr/28/help-your-organisation-embrace-and-nurture" +
          "-change-in-a-fast-moving-world",
        domSlotId = "dfp-ad--spbadge"
      )
    }
  }
}
