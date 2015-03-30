package integration

import org.scalatest.tags.Retryable
import org.scalatest.{DoNotDiscover, FlatSpec, Matchers}

@DoNotDiscover @Retryable class MostPopularTest extends FlatSpec with Matchers with SharedWebDriver {

  "Content pages" should "have functioning most popular components" in {

    get("/books/2014/oct/15/dylan-thomas-in-fitzrovia-griff-rhys-jones")
    implicitlyWait(5)

    withClue("Should show the 'most popular' component") {
      first("[data-test-id='popular-in']").isDisplayed should be (true)
    }

    withClue("Should show global most popular once tab is clicked") {
      val hiddenItem = first("#tabs-popular-2")

      hiddenItem.isDisplayed should be(false)

      first("#tabs-popular-2-tab a").click()

      hiddenItem.isDisplayed should be(true)
    }
  }
}
