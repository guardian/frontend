package test

import org.scalatest.{DoNotDiscover, FeatureSpec, GivenWhenThen, Matchers}
import services.IndexPagePagination
import collection.JavaConversions._
import conf.switches.Switches
import org.fluentlenium.core.domain.{FluentWebElement, FluentList}

@DoNotDiscover class TagFeatureTest extends FeatureSpec with GivenWhenThen with Matchers with ConfiguredTestSuite {

  feature("Tag Series, Blogs and Contributors Pages trail size") {

    scenario("Tag Series, Blogs and Contributors pages should show 50 trails (includes leadContent if present)") {

      Given("I visit a tag page")

      goTo("/technology/askjack") { browser =>
        val trails = browser.$(".fc-item__container")
        trails.length should be(IndexPagePagination.pageSize)
      }
    }
  }

  feature("Contributor pages") {

    scenario("Should display the profile images") {

      Given("I visit the 'Jemima Kiss' contributor page")
      Switches.ImageServerSwitch.switchOn()

      goTo("/profile/jemimakiss") { browser =>
        Then("I should see her profile image")
        val profileImage = browser.findFirst("[data-test-id=header-image]")
        profileImage.getAttribute("src") should include(s"42593747/Jemima-Kiss.jpg")
      }
    }

    scenario("Should not not display profiles where they don't exist") {

      Given("I visit the 'Sam Jones' contributor page")
      goTo("/profile/samjones") { browser =>
        Then("I should not see her profile image")
        val profileImages = browser.find(".profile__img img")
        profileImages.length should be(0)
      }

    }
  }

  feature("Tag Pages Football Nav") {

    scenario("Pagination") {

      Given("I visit the 'Cycling' tag page")

      goTo("/sport/cycling") { browser =>
        import browser._

        val cardsOnFirstPage = browser.find("[data-test-id=facia-card]")
        val dataIdsOnFirstPage = cardsOnFirstPage.map(_.getAttribute("data-id")).toSet
        cardsOnFirstPage.size should be > 10
        findByRel($("link"), "next").head.getAttribute("href") should endWith ("/sport/cycling?page=2")
        findByRel($("link"), "prev") should be (None)

        Then("I should be able to navigate to the 'next' page")
        findFirst(".pagination").findFirst("[rel=next]").click()
        val cardsOnNextPage = browser.find("[data-test-id=facia-card]")
        val dataIdsOnNextPage = cardsOnNextPage.map(_.getAttribute("data-id"))
        cardsOnNextPage.size should be > 10

        findByRel($("link"), "next").head.getAttribute("href") should endWith ("/sport/cycling?page=3")
        findByRel($("link"), "prev").head.getAttribute("href") should endWith ("/sport/cycling")

        dataIdsOnFirstPage intersect dataIdsOnNextPage.toSet should be(Set.empty)

        And("The title should reflect the page number")
        findFirst("title").getText should include ("| Page 2 of")

        And("I should be able to navigate to the 'previous' page")
        findFirst(".pagination").findFirst("[rel=prev]").click()
        val cardsOnPreviousPage = browser.find("[data-test-id=facia-card]")
        cardsOnPreviousPage.map(_.getAttribute("data-id")).toSet should be(dataIdsOnFirstPage)
      }
    }
  }

  //I'm not having a happy time with the selectors on links...
  private def findByRel(elements: FluentList[FluentWebElement], rel: String) = elements.toSeq.find(_.getAttribute("rel") == rel)
}
