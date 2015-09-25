package commercial

import integration.SharedWebDriver
import org.openqa.selenium.WebElement
import org.scalatest._

class AdsTest
  extends FlatSpec
  with Matchers
  with OptionValues
  with BeforeAndAfterAll
  with SharedWebDriver {

  override protected def beforeAll(): Unit = implicitlyWait(40)

  private def findComponent(path: String, selector: String): WebElement = {
    get(path, ads = true)
    first(selector)
  }

  private def findLogo(path: String, domSlotId: String): WebElement = {
    findComponent(path, s"#$domSlotId > div > a > img")
  }

  private def shouldBeVisible(maybeComponent: => WebElement): Unit = {
    withClue(s"Page source: ${webDriver.getPageSource}") {
      maybeComponent shouldBe 'displayed
    }
  }

  "Ads" should "display on the sport front" in {
    get("/uk/sport", ads = true)
    shouldBeVisible(first("#dfp-ad--top-above-nav > *"))
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
