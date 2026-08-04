package ab

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.DoNotDiscover
import play.api.mvc.RequestHeader
import play.api.test.FakeRequest

@DoNotDiscover class PuzzlesHubExperimentTest extends AnyFlatSpec with Matchers {
  private val abTestHeader = "X-GU-Server-AB-Tests"

  private def requestWithParticipation(participations: String): RequestHeader = {
    val request = FakeRequest().withHeaders(abTestHeader -> participations)
    ABTests.decorateRequest(abTestHeader)(request)
  }

  "PuzzlesHubExperiment.isEnabled" should "return true when the user is in the variant group" in {
    implicit val request: RequestHeader = requestWithParticipation("puzzles-new-hub:variant")
    PuzzlesHubExperiment.isEnabled should be(true)
  }

  it should "return false for the control group" in {
    implicit val request: RequestHeader = requestWithParticipation("puzzles-new-hub:control")
    PuzzlesHubExperiment.isEnabled should be(false)
  }

  it should "return false for an unknown group" in {
    implicit val request: RequestHeader = requestWithParticipation("puzzles-new-hub:unknown")
    PuzzlesHubExperiment.isEnabled should be(false)
  }

  it should "return false when the experiment participation is absent" in {
    implicit val request: RequestHeader = requestWithParticipation("another-test:variant")
    PuzzlesHubExperiment.isEnabled should be(false)
  }

  it should "return false when the request has not been decorated" in {
    implicit val request: RequestHeader = FakeRequest()
    PuzzlesHubExperiment.isEnabled should be(false)
  }

  it should "return false for malformed experiment data" in {
    implicit val request: RequestHeader = requestWithParticipation("puzzles-new-hub:variant:extra")
    PuzzlesHubExperiment.isEnabled should be(false)
  }

  it should "ignore unrelated experiment participations" in {
    implicit val request: RequestHeader = requestWithParticipation("another-test:control,puzzles-new-hub:variant")
    PuzzlesHubExperiment.isEnabled should be(true)
    ABTests.getParticipations(request) should contain theSameElementsAs Map(
      "another-test" -> "control",
      "puzzles-new-hub" -> "variant",
    )
  }
}
