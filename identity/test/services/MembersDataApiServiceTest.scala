package services

import conf.IdentityConfiguration
import org.scalatest.mockito.MockitoSugar
import org.scalatest.AsyncFlatSpec
import org.scalatest.Matchers._
import org.mockito.Mockito._
import org.mockito.Matchers._
import play.api.libs.ws.{WSClient, WSRequest, WSResponse}
import play.api.mvc.{Cookie, Cookies}
import play.api.libs.json.Json
import scala.concurrent.Future

class MembersDataApiServiceTest
  extends AsyncFlatSpec
  with MockitoSugar {

  val mdapiApiRoot = "https://mdapimock.com"
  val testUserId = "10000001"

  val valid404ResponseJsonString =
    """
      |{
      |  "message":"Not found",
      |  "details":"Could not find user in the database",
      |  "statusCode":404
      |}
    """.stripMargin

  val validMdapiResponseJsonString =
    """
      |{
      |"userId": "10000001",
      |"contentAccess": {
      |"member": true,
      |"paidMember": true,
      |"recurringContributor": false,
      |"digitalPack": true,
      |"paperSubscriber": false,
      |"guardianWeeklySubscriber": true
      |}
      |}
    """.stripMargin

  val invalidMdapiResponseJsonString =
    """
      |{
      |"userId": "10000001",
      |"contentAccess": {
      |"member": true,
      |"paidMember": true,
      |"digitalPack": true,
      |"paperSubscriber": false,
      |"guardianWeeklySubscriber": true
      |}
      |}
    """.stripMargin


  private val config = mock[IdentityConfiguration]
  private val cookies = Cookies(Seq(Cookie("Cookie1", "hash", None, "/", None, false, true, None), Cookie("Cookie2", "hash", None, "/", None, false, true, None)))

  private val wsThrow = mock[NullPointerException]
  private val wsMock = mock[WSClient]
  private val wsRequestMock = mock[WSRequest]
  private val wsResponseMock = mock[WSResponse]
  private val MdapiService = new MembersDataApiService(wsMock, config)

  when(wsMock.url(anyString())).thenReturn(wsRequestMock)
  when(wsRequestMock.withCookies(any())).thenReturn(wsRequestMock)

  "getUserContentAccess" should
    "return ContentAccess data for user with valid cookies" in {
    when(wsRequestMock.get()).thenReturn(Future.successful(wsResponseMock))
    when(wsResponseMock.json).thenReturn(Json.parse(validMdapiResponseJsonString))
    when(wsResponseMock.status).thenReturn(200)
    when(wsResponseMock.statusText).thenReturn("OK")

    val futureResult = MdapiService.getUserContentAccess(cookies)
    futureResult map {
      result =>
        result.fold(l => println(s"left error:${l.message}"), r => (println(s"right: $r")))
        result.isRight shouldBe true
    }
    futureResult map { result => result.right.get shouldEqual ContentAccess(true,true,false,true,false,true)}
  }

  it should "return MdapiServiceException if service returns 404 status" in {
    when(wsRequestMock.get()).thenReturn(Future.successful(wsResponseMock))
    when(wsResponseMock.json).thenReturn(Json.parse(valid404ResponseJsonString))
    when(wsResponseMock.status).thenReturn(404)
    when(wsResponseMock.statusText).thenReturn("Not Found")

    val futureResult = MdapiService.getUserContentAccess(cookies)
    futureResult map {
      result =>
        result.fold(l => println(s"left error:${l.message}"), r => (println(s"right: $r")))
        result.isLeft shouldBe true
    }
  }

  it should "return MdapiServiceException if service is unavailable" in {
    when(wsRequestMock.get()).thenReturn(Future.failed(wsThrow))

    val futureResult = MdapiService.getUserContentAccess(cookies)
    futureResult map {
      result =>
        result.fold(l => println(s"left error:${l.message}"), r => (println(s"right: $r")))
        result.isLeft shouldBe true
    }
  }

  it should "return MdapiServiceException if unable to extract ContentAccess from json response" in {
    when(wsRequestMock.get()).thenReturn(Future.successful(wsResponseMock))
    when(wsResponseMock.json).thenReturn(Json.parse(invalidMdapiResponseJsonString))
    when(wsResponseMock.status).thenReturn(200)

    val futureResult = MdapiService.getUserContentAccess(cookies)
    futureResult map {
      result =>
        result.fold(l => println(s"left error:${l.message}"), r => (println(s"right: $r")))
        result.isLeft shouldBe true
    }
  }

  //    it should "??? if user does not have valid cookies" in {
  //      ???
  //    }

}
