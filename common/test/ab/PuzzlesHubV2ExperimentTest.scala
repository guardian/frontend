package ab

import org.scalatest.DoNotDiscover
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import play.api.mvc.RequestHeader
import play.api.test.FakeRequest

@DoNotDiscover class PuzzlesHubV2ExperimentTest extends AnyFlatSpec with Matchers {
  private def requestWithParticipation(participations: String, edition: String): RequestHeader = {
    val request = FakeRequest().withHeaders("X-GU-Server-AB-Tests" -> participations, "X-Gu-Edition" -> edition)
    ABTests.decorateRequest("X-GU-Server-AB-Tests")(request)
  }

  Seq(
    ("", "INT", false),
    ("puzzles-new-hub-v2:variant", "UK", false),
    ("puzzles-new-hub-v2:variant", "US", false),
    ("puzzles-new-hub-v2:control", "INT", false),
    ("puzzles-new-hub-v2:unknown", "INT", false),
    ("puzzles-new-hub-v2:,puzzles-new-hub-v2:variant:extra", "INT", false),
    ("another-test:variant", "INT", false),
    ("puzzles-new-hub-v2:variant", "INT", true),
  ).foreach { case (participations, edition, expected) =>
    "PuzzlesHubV2Experiment" should s"require the International edition and the variant outside development for '$participations' in $edition" in {
      implicit val request: RequestHeader = requestWithParticipation(participations, edition)
      PuzzlesHubV2Experiment.isEnabled(isDevelopment = false) shouldBe expected
      PuzzlesHubV2Experiment.isEnabled shouldBe expected
    }
  }

  it should "not trust an undecorated header" in {
    implicit val request: RequestHeader = FakeRequest().withHeaders(
      "X-GU-Server-AB-Tests" -> "puzzles-new-hub-v2:variant",
      "X-Gu-Edition" -> "INT",
    )
    PuzzlesHubV2Experiment.isEnabled(isDevelopment = false) shouldBe false
  }

  it should "preserve the local development bypass without participation" in {
    implicit val request: RequestHeader = FakeRequest()
    PuzzlesHubV2Experiment.isEnabled(isDevelopment = true) shouldBe true
  }
}
