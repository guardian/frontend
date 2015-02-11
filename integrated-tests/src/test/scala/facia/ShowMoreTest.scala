package facia

import driver.Driver
import org.scalatest.tags.Retryable
import org.scalatest.time.{Milliseconds, Span}
import org.scalatest.{FlatSpec, Matchers}


@Retryable class ShowMoreTest extends FlatSpec with Matchers with Driver {

  "Facia containers" should "have show more functionality" in {

    go to theguardian("/uk")

    def getNumberOfVisibleArticles() = countMatchingVisible("[data-test-id=facia-card]")

    withClue("Should show the 'show more' button") {
      first("[data-test-id='show-more']").isDisplayed should be (true)
    }

    withClue("Should show the hidden items once cta is clicked") {
      val articlesBefore = getNumberOfVisibleArticles()

      clickOn(first("[data-test-id='show-more']"))

      implicitlyWait(Span(1000, Milliseconds))

      getNumberOfVisibleArticles() should be.>(articlesBefore)
    }

    withClue("Should hide items once cta is clicked again") {
      val articlesBefore = getNumberOfVisibleArticles()

      clickOn(first("[data-test-id='show-more']"))

      implicitlyWait(Span(100, Milliseconds))

      getNumberOfVisibleArticles() should be.<(articlesBefore)
    }
  }
}
