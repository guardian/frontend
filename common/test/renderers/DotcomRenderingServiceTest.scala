package renderers

import model.CacheTime
import org.scalatestplus.mockito.MockitoSugar
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover, PrivateMethodTester}
import org.scalatest.matchers.should.Matchers
import test.{ConfiguredTestSuite, TestRequest, WithMaterializer, WithTestWsClient}
import play.api.libs.ws.{WSClient, WSRequest, WSResponse}
import play.api.libs.json.JsString
import play.api.mvc.Result
import conf.Configuration
import org.mockito.Mockito.when
import org.mockito.ArgumentMatchers._

import scala.concurrent.Future
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.flatspec.AnyFlatSpec

@DoNotDiscover class DotcomRenderingServiceTest
    extends AnyFlatSpec
    with Matchers
    with ConfiguredTestSuite
    with MockitoSugar
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestWsClient
    with PrivateMethodTester
    with ScalaFutures {

  val dotcomRenderingService = DotcomRenderingService()
  val articleUrl = "politics/2021/oct/07/coronavirus-report-warned-of-impact-on-uk-four-years-before-pandemic"
  val post = PrivateMethod[Future[Result]](Symbol("post"))
  val request = TestRequest()
  private val wsMock = mock[WSClient]
  private val wsResponseMock = mock[WSResponse]
  private val wsRequestMock = mock[WSRequest]

  "post" should "return a 404 for DCR 415 errors" in {
    val payload = JsString("payload")
    when(wsMock.url(any[String])).thenReturn(wsRequestMock)
    when(wsRequestMock.withRequestTimeout(any())).thenReturn(wsRequestMock)
    when(wsRequestMock.addHttpHeaders(any())).thenReturn(wsRequestMock)
    when(wsRequestMock.post(payload)).thenReturn(Future.successful(wsResponseMock))
    when(wsResponseMock.status).thenReturn(415)

    whenReady(
      dotcomRenderingService invokePrivate post(
        wsMock,
        payload,
        "https://endpoint.com",
        CacheTime.Default,
        Configuration.rendering.timeout,
        request,
      ),
    ) { result =>
      result.header.status should be(404)
    }

  }

}
