package agents

import common.Edition
import contentapi.ContentApiClient
import model.dotcomrendering.OnwardCollectionResponse
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover}
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import services.OphanApi
import test.{
  ConfiguredTestSuite,
  WithMaterializer,
  WithTestApplicationContext,
  WithTestContentApiClient,
  WithTestExecutionContext,
  WithTestWsClient,
}

@DoNotDiscover class DeeplyReadAgentTest
    extends AnyFlatSpec
    with Matchers
    with ConfiguredTestSuite
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestWsClient
    with WithTestApplicationContext
    with WithTestContentApiClient {
  "DeeplyReadAgent" should "initialise with trails being an empty Seq" in {
    val ophanApi = new OphanApi(wsClient)
    val contentApiClient = testContentApiClient
    val agent = new DeeplyReadAgent(
      contentApiClient = contentApiClient,
      ophanApi = ophanApi,
    )
    Edition.all.map(edition => {
      agent.getTrails(edition) shouldBe Seq.empty
    })
  }
}
