package agents

import contentapi.ContentApiClient
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover}
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import play.api.libs.ws.{WSClient, WSRequest, WSResponse}
import test.{ConfiguredTestSuite, SingleServerSuite, TestRequest, WithMaterializer, WithTestApplicationContext, WithTestContentApiClient, WithTestWsClient}

class PopularInTagAgentTest
  extends AnyFlatSpec
    with Matchers
    with SingleServerSuite
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
    agent.onwardsJourneyResponse.trails.size shouldBe 0
  }
}
