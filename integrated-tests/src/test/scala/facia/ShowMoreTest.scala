package integration

import org.scalatest.tags.Retryable
import org.scalatest.{DoNotDiscover, FlatSpec, Matchers}

@DoNotDiscover @Retryable class ShowMoreTest extends FlatSpec with Matchers with SharedWebDriver {

  "Facia containers" should "have show more functionality" in {

    get("/uk")
    implicitlyWait(1)

    withClue("Should show the 'show more' button") {
      first("[data-test-id='show-more']").isDisplayed should be (true)
    }
  }
}
