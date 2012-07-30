import org.scalatest.matchers.ShouldMatchers
import org.scalatest.{ GivenWhenThen, FeatureSpec }
import test.`package`._

class ArticleFeatureTest extends FeatureSpec with GivenWhenThen with ShouldMatchers {

  feature("rendering an article") {

    scenario("correct placeholder for ad is rendered") {

      given("the user navigates to a page")
      HtmlUnit("/environment/2012/feb/22/capitalise-low-carbon-future") { browser =>
        import browser._

        when("the page is rendered")

        then("the ad slot placeholder is rendered")
        val adPlaceholder = $("#ad-slot-top-banner-ad").first()

        and("the placeholder has the correct slot names")
        adPlaceholder.getAttribute("data-base") should be("x50")
        adPlaceholder.getAttribute("data-median") should be("x52")
        adPlaceholder.getAttribute("data-extended") should be("x54")

        and("the placeholder has the correct class name")
        adPlaceholder.getAttribute("class") should be("ad-slot")

        and("the placeholder has the correct analytics name")
        adPlaceholder.getAttribute("data-link-name") should be("ad slot top-banner-ad")
      }
    }
  }
}
