package common

import common.editions._
import org.scalatest.DoNotDiscover
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import play.api.mvc.RequestHeader
import play.api.test.FakeRequest

@DoNotDiscover class PuzzlesHubAccessTest extends AnyFlatSpec with Matchers {
  private def requestWithEdition(edition: String): RequestHeader =
    FakeRequest().withHeaders("X-Gu-Edition" -> edition)

  "PuzzlesHubAccess.isAvailable" should "return true for every edition" in {
    Seq("INT", "EUR", "AU", "US", "UK").foreach { edition =>
      implicit val request: RequestHeader = requestWithEdition(edition)
      PuzzlesHubAccess.isAvailable should be(true)
    }
  }

  it should "return true when the request has no edition, as the default edition is UK" in {
    implicit val request: RequestHeader = FakeRequest()
    PuzzlesHubAccess.isAvailable should be(true)
  }

  it should "return true for an unknown edition, as it falls back to the default edition (UK)" in {
    implicit val request: RequestHeader = requestWithEdition("not-an-edition")
    PuzzlesHubAccess.isAvailable should be(true)
  }

  it should "return true in local development whatever the edition" in {
    PuzzlesHubAccess.isAvailable(isDevelopment = true, edition = Uk) should be(true)
  }

  it should "list every edition for now" in {
    PuzzlesHubAccess.Editions should be(Set(International, Europe, Au, Us, Uk))
  }
}
