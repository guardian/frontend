package agents

import model.dotcomrendering.OnwardCollectionResponse
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class DeeplyReadAgentTest extends AnyFlatSpec with Matchers {
  "DeeplyReadAgent" should "initialise with trails being an empty Seq" in {
    val agent = new DeeplyReadAgent()
    agent.onwardsJourneyResponse.trails shouldBe Seq.empty
  }
}
