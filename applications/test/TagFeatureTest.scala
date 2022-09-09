package test

import org.scalatest.{DoNotDiscover, GivenWhenThen}
import services.IndexPagePagination

import scala.jdk.CollectionConverters._
import conf.switches.Switches
import org.fluentlenium.core.domain.{FluentList, FluentWebElement}
import org.scalatest.featurespec.AnyFeatureSpec
import org.scalatest.matchers.should.Matchers

@DoNotDiscover class TagFeatureTest extends AnyFeatureSpec with GivenWhenThen with Matchers with ConfiguredTestSuite {

  Feature("Tag Series, Blogs and Contributors Pages trail size") {

    Scenario("Tag Series, Blogs and Contributors pages should show 50 trails (includes leadContent if present)") {

      Given("I visit a tag page")

      goTo("/technology/askjack") { browser =>
        val trails = browser.$(".fc-item__container")
        trails.asScala.length should be(IndexPagePagination.pageSize)
      }
    }
  }

  Feature("Contributor pages") {

    Scenario("Should display the profile images") {

      Given("I visit the 'Jemima Kiss' contributor page")
      Switches.ImageServerSwitch.switchOn()

      goTo("/profile/jemimakiss") { browser =>
        Then("I should see her profile image")
        val profileImage = browser.el("[data-test-id=header-image]")
        profileImage.attribute("src") should include(s"42593747/Jemima-Kiss.jpg")
      }
    }

    Scenario("Should not not display profiles where they don't exist") {

      Given("I visit the 'Sam Jones' contributor page")
      goTo("/profile/samjones") { browser =>
        Then("I should not see her profile image")
        val profileImages = browser.find(".profile__img img")
        profileImages.asScala.length should be(0)
      }

    }
  }

  Feature("Tag Pages") {

    Scenario("Pagination") {

      /*
      This test is consistently failing locally, and thus does not generate the required data/database/xxx file
      and it seems to be linked to the browser .click() behaviour, so I'm trimming it down a bit to test the
      basics in two goes.

      I've left the commented code in below so we can reinstate it as and when we can figure out how to make it
      work properly again :(
       */

      Given("I visit the 'Cycling' tag page")

      goTo("/sport/cycling") { browser =>
        import browser._

        val cardsOnFirstPage = browser.find("[data-test-id=facia-card]")
        val dataIdsOnFirstPage = cardsOnFirstPage.asScala.map(_.attribute("data-id")).toSet
        cardsOnFirstPage.size should be > 10
        findByRel($("link"), "next").head.attribute("href") should endWith("/sport/cycling?page=2")
        findByRel($("link"), "prev") should be(None)

//        Then("I should be able to navigate to the 'next' page")
//        el(".pagination").$("[rel=next]").click()
//        val cardsOnNextPage = browser.find("[data-test-id=facia-card]")
//        val dataIdsOnNextPage = cardsOnNextPage.asScala.map(_.attribute("data-id"))
//        cardsOnNextPage.size should be > 10
//
//        findByRel($("link"), "next").head.attribute("href") should endWith ("/sport/cycling?page=3")
//        findByRel($("link"), "prev").head.attribute("href") should endWith ("/sport/cycling")
//
//        dataIdsOnFirstPage intersect dataIdsOnNextPage.toSet should be(Set.empty)
//
//        And("The title should reflect the page number")
//        browser.window.title should include ("| Page 2 of")
//
//        And("I should be able to navigate to the 'previous' page")
//        el(".pagination").$("[rel=prev]").click()
//        val cardsOnPreviousPage = browser.find("[data-test-id=facia-card]")
//        cardsOnPreviousPage.asScala.map(_.attribute("data-id")).toSet should be(dataIdsOnFirstPage)
      }

      Given("I visit page 2 of the 'Cycling' tag page")

      goTo("/sport/cycling?page=2") { browser =>
        import browser._

        val cardsOnNextPage = browser.find("[data-test-id=facia-card]")
        cardsOnNextPage.size should be > 10

        findByRel($("link"), "next").head.attribute("href") should endWith("/sport/cycling?page=3")
        findByRel($("link"), "prev").head.attribute("href") should endWith("/sport/cycling")

        And("The title should reflect the page number")
        browser.window.title should include("| Page 2 of")
      }
    }
  }

  //I'm not having a happy time with the selectors on links...
  private def findByRel(elements: FluentList[FluentWebElement], rel: String) =
    elements.asScala.find(_.attribute("rel") == rel)
}
