package services

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class ElectionResultsAgentTest extends AnyFlatSpec with Matchers {

  it should "initialise with results being an empty Seq" in {
    val electionResultsAgent = new ElectionResultsAgent()
    electionResultsAgent.getResults shouldBe Map.empty
  }

}
