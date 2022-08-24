package agents

import model.dotcomrendering.OnwardCollectionResponse
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class CuratedContentAgentTest extends AnyFlatSpec with Matchers {
  "CuratedContentAgentTest" should "initialise with trails being an empty Seq" in {
    val agent = new CuratedContentAgent()
    agent.onwardsJourneyResponse.trails shouldBe Seq.empty
  }
}
