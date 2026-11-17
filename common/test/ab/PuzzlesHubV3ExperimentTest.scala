package ab

import org.scalatest.DoNotDiscover
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import play.api.mvc.RequestHeader
import play.api.test.FakeRequest

@DoNotDiscover class PuzzlesHubV3ExperimentTest extends AnyFlatSpec with Matchers {
  private def requestWithParticipation(participations: String, edition: String): RequestHeader = {
    val request = FakeRequest().withHeaders("X-GU-Server-AB-Tests" -> participations, "X-Gu-Edition" -> edition)
    ABTests.decorateRequest("X-GU-Server-AB-Tests")(request)
  }

  Seq(
    ("", "INT", false),
    ("puzzles-new-hub-v3:variant", "INT", false),
    ("puzzles-new-hub-v2:variant", "INT", false),
    ("puzzles-new-hub-v2:variant,puzzles-new-hub-v3:variant", "UK", false),
    ("puzzles-new-hub-v2:variant,puzzles-new-hub-v3:variant", "US", false),
    ("puzzles-new-hub-v2:control,puzzles-new-hub-v3:variant", "INT", false),
    ("puzzles-new-hub-v2:variant,puzzles-new-hub-v3:control", "INT", false),
    ("puzzles-new-hub-v2:variant,puzzles-new-hub-v3:unknown", "INT", false),
    ("another-test:variant", "INT", false),
    ("puzzles-new-hub-v2:variant,puzzles-new-hub-v3:variant", "INT", true),
    ("puzzles-new-hub-v2:variant,puzzles-new-hub-v3:variant", "EUR", true),
    ("puzzles-new-hub-v2:variant,puzzles-new-hub-v3:variant", "AU", true),
  ).foreach { case (participations, edition, expected) =>
    "PuzzlesHubV3Experiment" should s"require a hub edition and the v2 and v3 variants outside development for '$participations' in $edition" in {
      implicit val request: RequestHeader = requestWithParticipation(participations, edition)
      PuzzlesHubV3Experiment.isEnabled(isDevelopment = false) shouldBe expected
      PuzzlesHubV3Experiment.isEnabled shouldBe expected
    }
  }

  it should "not trust an undecorated header" in {
    implicit val request: RequestHeader = FakeRequest().withHeaders(
      "X-GU-Server-AB-Tests" -> "puzzles-new-hub-v2:variant,puzzles-new-hub-v3:variant",
      "X-Gu-Edition" -> "INT",
    )
    PuzzlesHubV3Experiment.isEnabled(isDevelopment = false) shouldBe false
  }

  it should "preserve the local development bypass without participation" in {
    implicit val request: RequestHeader = FakeRequest()
    PuzzlesHubV3Experiment.isEnabled(isDevelopment = true) shouldBe true
  }
}
