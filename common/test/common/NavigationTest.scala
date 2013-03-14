package common

import org.scalatest.FlatSpec
import org.scalatest.matchers.ShouldMatchers
import play.api.test.FakeRequest

class NavigationTest extends FlatSpec with ShouldMatchers {

  "Navigation" should "have the correct sections" in {
    val request = FakeRequest("GET", "http://foo.bar.com>").withHeaders("host" -> "http://loclahost:9000")

    val sectionTitles = Navigation(request).map(_.title)

    sectionTitles should be(Seq(
      "Home", "UK news", "World news", "Sport", "Football", "Comment is free",
      "Life &amp; style", "Culture", "Business", "Technology", "Environment", "Soulmates", "Jobs"
    ))
  }

}
