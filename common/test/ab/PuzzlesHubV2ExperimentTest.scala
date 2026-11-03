package ab

import org.scalatest.DoNotDiscover
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import play.api.mvc.RequestHeader
import play.api.test.FakeRequest

@DoNotDiscover class PuzzlesHubV2ExperimentTest extends AnyFlatSpec with Matchers {
  private def requestWithParticipation(participations: String): RequestHeader = {
    val request = FakeRequest().withHeaders("X-GU-Server-AB-Tests" -> participations)
    ABTests.decorateRequest("X-GU-Server-AB-Tests")(request)
  }

  Seq(
    "" -> false,
    "puzzles-new-hub-v1:variant" -> false,
    "puzzles-new-hub-v2:variant" -> false,
    "puzzles-new-hub-v1:control,puzzles-new-hub-v2:variant" -> false,
    "puzzles-new-hub-v1:variant,puzzles-new-hub-v2:control" -> false,
    "puzzles-new-hub-v1:variant,puzzles-new-hub-v2:unknown" -> false,
    "puzzles-new-hub-v1:variant,puzzles-new-hub-v2:,puzzles-new-hub-v2:variant:extra" -> false,
    "puzzles-new-hub-v1:variant:extra,puzzles-new-hub-v2:variant" -> false,
    "another-test:variant" -> false,
    "puzzles-new-hub-v1:variant,puzzles-new-hub-v2:variant" -> true,
  ).foreach { case (participations, expected) =>
    "PuzzlesHubV2Experiment" should s"require both variants outside development for '$participations'" in {
      implicit val request: RequestHeader = requestWithParticipation(participations)
      PuzzlesHubV2Experiment.isEnabled(isDevelopment = false) shouldBe expected
      PuzzlesHubV2Experiment.isEnabled shouldBe expected
    }
  }

  it should "not trust an undecorated header" in {
    implicit val request: RequestHeader = FakeRequest().withHeaders(
      "X-GU-Server-AB-Tests" -> "puzzles-new-hub-v1:variant,puzzles-new-hub-v2:variant",
    )
    PuzzlesHubV2Experiment.isEnabled(isDevelopment = false) shouldBe false
  }

  it should "preserve the local development bypass without participation" in {
    implicit val request: RequestHeader = FakeRequest()
    PuzzlesHubV2Experiment.isEnabled(isDevelopment = true) shouldBe true
  }
}
