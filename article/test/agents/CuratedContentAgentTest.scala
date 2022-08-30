package agents

import org.scalatest.BeforeAndAfterAll
import model.dotcomrendering.OnwardCollectionResponse
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import test._

class CuratedContentAgentTest
    extends AnyFlatSpec
    with Matchers
    with SingleServerSuite
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestWsClient
    with WithTestApplicationContext
    with WithTestContentApiClient
    with WithTestFrontJsonFapi {
  "CuratedContentAgentTest" should "initialise with trails being an empty Seq" in {
    val curatedContentAgent = new CuratedContentAgent(fapi)
    curatedContentAgent.getCuratedContent shouldBe Map.empty
  }
}
