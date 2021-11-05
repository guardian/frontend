package renderers

import model.dotcomrendering.PageType
import org.apache.commons.codec.digest.DigestUtils
import org.scalatest.mockito.MockitoSugar
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover, FlatSpec, Matchers, PrivateMethodTester}
import play.api.test.Helpers._
import play.api.test._
import test.{ConfiguredTestSuite, TestRequest, WithMaterializer, WithTestApplicationContext, WithTestWsClient}
import play.api.libs.ws.WSClient
import play.api.mvc.{RequestHeader, Result, Results}
import scala.concurrent.{ExecutionContext, Future}

@DoNotDiscover class DotcomRenderingServiceTest
    extends FlatSpec
    with Matchers
    with ConfiguredTestSuite
    with MockitoSugar
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestWsClient
    with WithTestApplicationContext
    with PrivateMethodTester {

  val dotcomRenderingService = DotcomRenderingService()
  val articleUrl = "politics/2021/oct/07/coronavirus-report-warned-of-impact-on-uk-four-years-before-pandemic"
  val post = PrivateMethod[Future[Result]]('post)

  "post" should "return a 404 for DCR 415 errors" in {
    val result = dotcomRenderingService invokePrivate post()

//    val result = dotcomRenderingService invokePrivate post(
//      wsClient,
//      "payloadString",
//      "https://an-endpoint.com",
//      "page",
//    )

//    result should be(404)
  }

}
