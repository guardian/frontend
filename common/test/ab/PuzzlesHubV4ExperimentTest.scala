package ab

import org.scalatest.DoNotDiscover
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import play.api.mvc.RequestHeader
import play.api.test.FakeRequest

@DoNotDiscover class PuzzlesHubV4ExperimentTest extends AnyFlatSpec with Matchers {
  private def requestWithParticipation(participations: String): RequestHeader = {
    val request = FakeRequest().withHeaders("X-GU-Server-AB-Tests" -> participations)
    ABTests.decorateRequest("X-GU-Server-AB-Tests")(request)
  }

  Seq(
    ("", false),
    ("puzzles-new-hub-v3:variant,puzzles-new-hub-v4:variant", true),
    ("puzzles-new-hub-v3:variant", false),
    ("puzzles-new-hub-v4:variant", false),
    ("puzzles-new-hub-v3:control,puzzles-new-hub-v4:variant", false),
    ("puzzles-new-hub-v3:variant,puzzles-new-hub-v4:control", false),
  ).foreach { case (participations, expected) =>
    "PuzzlesHubV4Experiment" should s"be $expected outside development for '$participations'" in {
      implicit val request: RequestHeader = requestWithParticipation(participations)
      PuzzlesHubV4Experiment.isEnabled(isDevelopment = false) shouldBe expected
      PuzzlesHubV4Experiment.isEnabled shouldBe expected
    }
  }

  it should "not trust an undecorated header" in {
    implicit val request: RequestHeader =
      FakeRequest().withHeaders("X-GU-Server-AB-Tests" -> "puzzles-new-hub-v3:variant,puzzles-new-hub-v4:variant")
    PuzzlesHubV4Experiment.isEnabled(isDevelopment = false) shouldBe false
  }

  it should "preserve the local development bypass without participation" in {
    implicit val request: RequestHeader = FakeRequest()
    PuzzlesHubV4Experiment.isEnabled(isDevelopment = true) shouldBe true
  }
}
