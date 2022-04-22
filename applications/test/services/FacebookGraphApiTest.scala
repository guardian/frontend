package services

import helpers.FacebookGraphApiTestClient
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover}
import test.{ConfiguredTestSuite, WithMaterializer, WithTestExecutionContext, WithTestWsClient}

@DoNotDiscover class FacebookGraphApiTest
    extends AnyFlatSpec
    with Matchers
    with ConfiguredTestSuite
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestWsClient
    with WithTestExecutionContext
    with ScalaFutures {

  lazy val facebookGraphApiClient = new FacebookGraphApiTestClient(wsClient)
  lazy val facebookGraphApi = new FacebookGraphApi(facebookGraphApiClient)

  it should "return a valid share count" in {
    val shareCountRequest =
      facebookGraphApi.shareCount("world/2016/dec/30/eight-charts-that-show-2016-wasnt-as-bad-as-you-think")

    whenReady(shareCountRequest) { result =>
      result should be > 0
    }
  }
}
