package common

import org.scalatest.FlatSpec
import org.scalatest.Matchers
import play.api.test.FakeRequest
import common.editions.{Uk, Us}
import play.api.mvc.Cookie

class EditionTest extends FlatSpec with Matchers {

  "Edition" should "resolve correct edition from header" in {

    val request = FakeRequest().withHeaders("X-Gu-Edition" -> "US", "host" -> "m.guardian.co.uk")

    Edition(request) should be(Us)
  }

  it should "resolve correct edition from parameter override" in {

    val request = FakeRequest("GET", "m.guardian.co.uk?_edition=us").withHeaders("host" -> "m.guardian.co.uk")

    Edition(request) should be(Us)
  }

  it should "resolve correct edition from cookie" in {

    val request = FakeRequest().withCookies(Cookie("GU_EDITION", "uS"))
      .withHeaders("host" -> "m.guardian.co.uk")

    Edition(request) should be(Us)
  }

  it should "default to UK edition" in {

    val request = FakeRequest().withHeaders("host" -> "m.somewhere.co.uk")

    Edition(request) should be(Uk)
  }

  "The Default Edition" should "include all possible editionalised sections" in {
    // because they are used as defaults for other editions that do not override them

    val defaultSections = Edition.defaultEdition.editionalisedSections.sorted
    val allSections = Edition.all.flatMap(_.editionalisedSections).distinct.sorted

    allSections should equal (defaultSections)
  }
}
