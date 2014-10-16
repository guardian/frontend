package common

import driver.Driver
import org.scalatest.tags.Retryable
import org.scalatest.{FlatSpec, Matchers}


@Retryable class MostPopularTest extends FlatSpec with Matchers with Driver {

  "Content pages" should "have functioning most popular components" in {

    go to theguardian("/books/2014/oct/15/dylan-thomas-in-fitzrovia-griff-rhys-jones")

    withClue("Should show the 'most popular' component") {
      first("[data-test-id='popular-in']").isDisplayed should be (true)
    }

    withClue("Should show global most popular once tab is clicked") {
      val hiddenItem = first("#tabs-popular-2")

      hiddenItem.isDisplayed should be(false)

      clickOn(first("#tabs-popular-2-tab a"))

      hiddenItem.isDisplayed should be(true)
    }

  }
}
