package services

import conf.IdentityConfiguration
import org.scalatest.mockito.MockitoSugar
import org.scalatest.AsyncFlatSpec
import org.scalatest.EitherValues
import org.scalatest.Matchers._
import org.mockito.Mockito._
import org.mockito.Matchers._
import play.api.libs.ws.{WSClient, WSRequest, WSResponse}
import play.api.mvc.{Cookie, Cookies}
import play.api.libs.json.Json

import scala.concurrent.Future

class MembersDataApiServiceTest
  extends AsyncFlatSpec
  with EitherValues
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

  private val wsMock = mock[WSClient]
  private val wsRequestMock = mock[WSRequest]
  private val wsResponseMock = mock[WSResponse]
  private val MdapiService = new MembersDataApiService(wsMock, config)

  when(wsMock.url(any[String])).thenReturn(wsRequestMock)
  when(wsRequestMock.withCookies(any())).thenReturn(wsRequestMock)

  "getUserContentAccess" should
    "return ContentAccess data for user with valid cookies" in {
    when(wsRequestMock.get()).thenReturn(Future.successful(wsResponseMock))
    when(wsResponseMock.json).thenReturn(Json.parse(validMdapiResponseJsonString))
    when(wsResponseMock.status).thenReturn(200)
    when(wsResponseMock.statusText).thenReturn("OK")

    val futureEither = MdapiService.getUserContentAccess(cookies)
    futureEither map { either => either.isRight shouldBe true }
    futureEither map { either => either.right.value shouldEqual ContentAccess(true,true,false,true,false,true) }
  }

  it should "return MdapiServiceException if unable to extract ContentAccess from json response" in {
    when(wsRequestMock.get()).thenReturn(Future.successful(wsResponseMock))
    when(wsResponseMock.json).thenReturn(Json.parse(invalidMdapiResponseJsonString))
    when(wsResponseMock.status).thenReturn(200)

    val futureEither = MdapiService.getUserContentAccess(cookies)
    futureEither map { either => either.isLeft shouldBe true }
    futureEither map { either => either.left.value.message should include ("Failed to parse MDAPI response")}
  }

  it should "return MdapiServiceException if service returns 404 status" in {
    when(wsRequestMock.get()).thenReturn(Future.successful(wsResponseMock))
    when(wsResponseMock.json).thenReturn(Json.parse(valid404ResponseJsonString))
    when(wsResponseMock.status).thenReturn(404)
    when(wsResponseMock.statusText).thenReturn("Not Found")

    val futureEither = MdapiService.getUserContentAccess(cookies)
    futureEither map { either => either.isLeft shouldBe true }
    futureEither map { either => either.left.value.message should include ("Failed to getUserContentAccess")}
  }

  "ContentAccess.canProceedWithAutoDeletion" should
    "return true when all cases are false" in {
    val contentAccess = ContentAccess(false, false, false, false, false, false)
    contentAccess.canProceedWithAutoDeletion shouldBe true
  }
    it should "return false if any cases are true" in {
      val contentAccess1 = ContentAccess(true, false, false, false, false, false)
      val contentAccess2 = ContentAccess(false, false, false, false, false, true)
      val contentAccess3 = ContentAccess(true, false, true, false, true, false)
      val contentAccess4 = ContentAccess(true, true, true, true, true, true)
      contentAccess1.canProceedWithAutoDeletion shouldBe false
      contentAccess2.canProceedWithAutoDeletion shouldBe false
      contentAccess3.canProceedWithAutoDeletion shouldBe false
      contentAccess4.canProceedWithAutoDeletion shouldBe false
    }

  "ContentAccess.hasSubscription" should
    "return false when all cases are false" in {
    val contentAccess = ContentAccess(false, false, false, false, false, false)
    contentAccess.hasSubscription shouldBe false
  }
  it should "return true if any cases are true" in {
    val contentAccess1 = ContentAccess(false, false, false, true, true, true)
    val contentAccess2 = ContentAccess(false, false, false, false, false, true)
    contentAccess1.hasSubscription shouldBe true
    contentAccess2.hasSubscription shouldBe true
  }
}
