package agents

import org.scalatest.{BeforeAndAfterAll, DoNotDiscover}
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import test.{ConfiguredTestSuite, WithMaterializer, WithTestApplicationContext, WithTestContentApiClient, WithTestWsClient}

@DoNotDiscover class PopularInTagAgentTest
  extends AnyFlatSpec
    with Matchers
    with ConfiguredTestSuite
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestWsClient
    with WithTestApplicationContext
    with WithTestContentApiClient {

  lazy val agent = new PopularInTagAgent(testContentApiClient)

  "PopularInTagAgent" should "initialise with trails being an empty Seq" in {
    agent.onwardsJourneyResponse.trails shouldBe Seq.empty
  }
  "PopularInTagAgent" should "get two trails from CAPI" in {
    agent.refresh
    agent.onwardsJourneyResponse.trails.size shouldBe 2
  }
}
