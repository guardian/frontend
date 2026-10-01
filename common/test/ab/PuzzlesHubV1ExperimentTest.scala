package ab

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.DoNotDiscover
import play.api.mvc.RequestHeader
import play.api.test.FakeRequest

@DoNotDiscover class PuzzlesHubV1ExperimentTest extends AnyFlatSpec with Matchers {
  private val abTestHeader = "X-GU-Server-AB-Tests"

  private def requestWithParticipation(participations: String): RequestHeader = {
    val request = FakeRequest().withHeaders(abTestHeader -> participations)
    ABTests.decorateRequest(abTestHeader)(request)
  }

  "PuzzlesHubV1Experiment.isEnabled" should "return true when both v0 and v1 are in the variant group" in {
    implicit val request: RequestHeader = requestWithParticipation("puzzles-new-hub:variant,puzzles-new-hub-v1:variant")
    PuzzlesHubV1Experiment.isEnabled should be(true)
  }

  it should "return false when only v1 is in the variant group" in {
    implicit val request: RequestHeader = requestWithParticipation("puzzles-new-hub-v1:variant")
    PuzzlesHubV1Experiment.isEnabled should be(false)
  }

  it should "return false when only v0 is in the variant group" in {
    implicit val request: RequestHeader = requestWithParticipation("puzzles-new-hub:variant")
    PuzzlesHubV1Experiment.isEnabled should be(false)
  }

  it should "return false when v1 is in the control group" in {
    implicit val request: RequestHeader = requestWithParticipation("puzzles-new-hub:variant,puzzles-new-hub-v1:control")
    PuzzlesHubV1Experiment.isEnabled should be(false)
  }

  it should "return true in local development without experiment participation" in {
    implicit val request: RequestHeader = FakeRequest()
    PuzzlesHubV1Experiment.isEnabled(isDevelopment = true) should be(true)
  }

  it should "return false when the request has not been decorated" in {
    implicit val request: RequestHeader = FakeRequest()
    PuzzlesHubV1Experiment.isEnabled should be(false)
  }
}
