package facia

import driver.Driver
import org.scalatest.tags.Retryable
import org.scalatest.{FlatSpec, Matchers}


@Retryable class ShowMoreTest extends FlatSpec with Matchers with Driver {

  "Facia containers" should "have show more functionality" in {

    go to theguardian("/uk")

    def getNumberOfArticles() = countMatching("[data-test-id=facia-card]")

    withClue("Should show the 'show more' button") {
      first("[data-test-id='show-more']").isDisplayed should be (true)
    }

    withClue("Should show the hidden items once cta is clicked") {
      val articlesBefore = getNumberOfArticles()

      clickOn(first("[data-test-id='show-more']"))

      getNumberOfArticles() should be.>(articlesBefore)
    }

    withClue("Should hide items once cta is clicked again") {
      val articlesBefore = getNumberOfArticles()

      clickOn(first("[data-test-id='show-more']"))

      getNumberOfArticles() should be.<(articlesBefore)
    }
  }
}
