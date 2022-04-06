package renderers

import model.{MetaData, Page, CacheTime}
import model.dotcomrendering.PageType
import org.apache.commons.codec.digest.DigestUtils
import org.scalatest.mockito.MockitoSugar
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover, FlatSpec, Matchers, PrivateMethodTester}
import play.api.test.Helpers._
import play.api.test._
import test.{ConfiguredTestSuite, TestRequest, WithMaterializer, WithTestWsClient}
import play.api.libs.ws.{WSClient, WSRequest, WSResponse}
import play.api.mvc.{RequestHeader, Result, Results}
import conf.Configuration
import org.mockito.Matchers.any
import org.mockito.Mockito.when
import scala.concurrent.{ExecutionContext, Future}
import org.scalatest.concurrent.ScalaFutures

@DoNotDiscover class DotcomRenderingServiceTest
    extends FlatSpec
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
  val post = PrivateMethod[Future[Result]]('post)
  val request = TestRequest()
  private case class fakePage() extends Page {
    override val metadata = MetaData.make(
      id = "",
      section = None,
      webTitle = "",
    )
  }
  private val wsMock = mock[WSClient]
  private val wsResponseMock = mock[WSResponse]
  private val wsRequestMock = mock[WSRequest]

  "post" should "return a 404 for DCR 415 errors" in {
    val payload = "payload"
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
