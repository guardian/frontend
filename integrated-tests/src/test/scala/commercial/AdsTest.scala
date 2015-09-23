package integration

import org.openqa.selenium.WebElement
import org.scalatest._

class AdsTest
  extends FlatSpec
  with Matchers
  with OptionValues
  with BeforeAndAfterAll
  with SharedWebDriver {

  private def findComponent(path: String, selector: String): WebElement = {
    get(path, ads = true)
    first(selector)
  }

  private def findLogo(path: String, domSlotId: String): WebElement = {
    findComponent(path, s"#$domSlotId > div > a > img")
  }

  private def shouldBeVisible(maybeComponent: => WebElement): Unit = {
//    withClue(s"Page source: ${pageSource}") {
      maybeComponent shouldBe 'displayed
//    }
  }

  "Ads" should "display on the sport front" in {

    implicitlyWait(20)

    get("/uk/sport", ads = true)

    withClue("Should display top banner ad") {
      shouldBeVisible(first("#dfp-ad--top-above-nav > *"))
      }

    withClue("Should display two MPUs") {
      shouldBeVisible(first("#dfp-ad--inline1 > *"))
      shouldBeVisible(first("#dfp-ad--inline2 > *"))
    }
  }

  "A logo" should "appear on a sponsored front" in {
    shouldBeVisible {
      findLogo(
        path = "/voluntary-sector-network/series/the-not-for-profit-debates",
        domSlotId = "dfp-ad--spbadge1"
      )
    }
  }

  it should "appear on a sponsored article" in {
    shouldBeVisible {
      findLogo(
        path = "/voluntary-sector-network/2015/apr/28/help-your-organisation-embrace-and-nurture" +
          "-change-in-a-fast-moving-world",
        domSlotId = "dfp-ad--spbadge"
      )
    }
  }
}
