package ab

import org.scalatest.DoNotDiscover
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import play.api.mvc.RequestHeader
import play.api.test.FakeRequest

@DoNotDiscover class PuzzlesHubV3ExperimentTest extends AnyFlatSpec with Matchers {
  private def requestWithParticipation(participations: String): RequestHeader = {
    val request = FakeRequest().withHeaders("X-GU-Server-AB-Tests" -> participations)
    ABTests.decorateRequest("X-GU-Server-AB-Tests")(request)
  }

  Seq(
    ("", false),
    ("puzzles-new-hub-v3:variant", true),
    ("puzzles-new-hub-v3:control", false),
    ("puzzles-new-hub-v3:unknown", false),
    ("puzzles-new-hub-v4:variant", false),
    ("another-test:variant", false),
  ).foreach { case (participations, expected) =>
    "PuzzlesHubV3Experiment" should s"be $expected outside development for '$participations'" in {
      implicit val request: RequestHeader = requestWithParticipation(participations)
      PuzzlesHubV3Experiment.isEnabled(isDevelopment = false) shouldBe expected
      PuzzlesHubV3Experiment.isEnabled shouldBe expected
    }
  }

  it should "not trust an undecorated header" in {
    implicit val request: RequestHeader =
      FakeRequest().withHeaders("X-GU-Server-AB-Tests" -> "puzzles-new-hub-v3:variant")
    PuzzlesHubV3Experiment.isEnabled(isDevelopment = false) shouldBe false
  }

  it should "preserve the local development bypass without participation" in {
    implicit val request: RequestHeader = FakeRequest()
    PuzzlesHubV3Experiment.isEnabled(isDevelopment = true) shouldBe true
  }
}
