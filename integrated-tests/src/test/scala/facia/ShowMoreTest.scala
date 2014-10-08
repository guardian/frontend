package facia

import driver.Driver
import org.scalatest.tags.Retryable
import org.scalatest.{FlatSpec, Matchers}


@Retryable class ShowMoreTest extends FlatSpec with Matchers with Driver {

  "Facia containers" should "have show more functionality" in {

    go to theguardian("/technology")

    withClue("Should show the 'show more' button") {
      first("[data-test-id='show-more']").isDisplayed should be (true)
    }

    withClue("Should show the hidden items once cta is clicked") {
      val hiddenItem = first(".js-hide")

      hiddenItem.isDisplayed should be(false)

      clickOn(first("[data-test-id='show-more']"))

      hiddenItem.isDisplayed should be(true)
    }

  }
}
