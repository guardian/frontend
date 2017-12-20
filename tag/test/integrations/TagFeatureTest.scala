package integrations

import conf.switches.Switches
import org.fluentlenium.core.domain.{FluentList, FluentWebElement}
import org.scalatest._
import play.api.test.TestBrowser
import services.TagPagePagination
import test.ConfiguredTestSuite

import collection.JavaConverters._

@DoNotDiscover class TagFeatureTest extends FeatureSpec with GivenWhenThen with Matchers with ConfiguredTestSuite {

  feature("Tag Series, Blogs and Contributors Pages trail size") {

    scenario("Tag Series, Blogs and Contributors pages should show 50 trails (includes leadContent if present)") {

      Given("I visit a tag page")

      goTo("/technology/askjack") { browser =>
        val trails = browser.$(".fc-item__container")
        trails.asScala.length should be(TagPagePagination.pageSize)
      }
    }
  }

  feature("Contributor pages") {

    scenario("Should display the profile images") {

      Given("I visit the 'Jemima Kiss' contributor page")
      Switches.ImageServerSwitch.switchOn()

      goTo("/profile/jemimakiss") { browser =>
        Then("I should see her profile image")
        val profileImage = browser.el("[data-test-id=header-image]")
        profileImage.attribute("src") should include(s"42593747/Jemima-Kiss.jpg")
      }
    }

    scenario("Should not not display profiles where they don't exist") {

      Given("I visit the 'Sam Jones' contributor page")
      goTo("/profile/samjones") { browser =>
        Then("I should not see her profile image")
        val profileImages = browser.find(".profile__img img")
        profileImages.asScala.length should be(0)
      }

    }
  }

  feature("Tag Pages") {

    scenario("Pagination") {

      Given("I visit the 'Cycling' tag page")

      goTo("/sport/cycling") { browser =>
        import browser._

        val cardsOnFirstPage = browser.find("[data-test-id=facia-card]")
        val dataIdsOnFirstPage = cardsOnFirstPage.asScala.map(_.attribute("data-id")).toSet
        cardsOnFirstPage.size should be > 10
        findByRel($("link"), "next").head.attribute("href") should endWith ("/sport/cycling?page=2")
        findByRel($("link"), "prev") should be (None)

        Then("I should be able to navigate to the 'next' page")
        el(".pagination").$("[rel=next]").click()
        val cardsOnNextPage = browser.find("[data-test-id=facia-card]")
        val dataIdsOnNextPage = cardsOnNextPage.asScala.map(_.attribute("data-id"))
        cardsOnNextPage.size should be > 10

        findByRel($("link"), "next").head.attribute("href") should endWith ("/sport/cycling?page=3")
        findByRel($("link"), "prev").head.attribute("href") should endWith ("/sport/cycling")

        dataIdsOnFirstPage intersect dataIdsOnNextPage.toSet should be(Set.empty)

        And("The title should reflect the page number")
        browser.window.title should include ("| Page 2 of")

        And("I should be able to navigate to the 'previous' page")
        el(".pagination").$("[rel=prev]").click()
        val cardsOnPreviousPage = browser.find("[data-test-id=facia-card]")
        cardsOnPreviousPage.asScala.map(_.attribute("data-id")).toSet should be(dataIdsOnFirstPage)
      }
    }
  }

  feature("Section Sponsorships") {
    def testFrontSponsorship(browser: TestBrowser, sponsorshipType: String): Assertion = {
      import browser._

      Then("the page should be styled differently")
      $(s".facia-container--$sponsorshipType").size should be (1)

      And(s"the ${sponsorshipType.replace("-", " ")} badge should be displayed")
      $(".js-sponsored-front") should have size 1
      $(s".facia-container--$sponsorshipType").attribute("data-sponsorship") should be (sponsorshipType)
    }

    /**
      * NOTE - these tests run off real sponsored data which might not be reliable
      *
      * If a test fails, i.e. because a sponsorship expires, see
      * https://frontend.gutools.co.uk/analytics/commercial/sponsorships for a different sponsorship to use
      *
      * If they fail often, might need to look into setting up a reliable data source
      */
    scenario("Advertisement Feature Front") {

      Given("I am on an advertisement feature front")
      goTo("/visa-partner-zone") { browser =>
        testFrontSponsorship(browser, "advertisement-feature");
      }

    }

    scenario("Sponsored Front") {

      Given("I am on ansponsored front")
      goTo("/sustainable-business/role-business-development") { browser =>
        testFrontSponsorship(browser, "sponsored");
      }

    }

    scenario("Foundation Supported Front") {

      Given("I am on a foundation supported front")
      goTo("/global-development") { browser =>
        testFrontSponsorship(browser, "foundation-supported");
      }

    }
  }

  //I'm not having a happy time with the selectors on links...
  private def findByRel(elements: FluentList[FluentWebElement], rel: String) = elements.asScala.find(_.attribute("rel") == rel)
}
