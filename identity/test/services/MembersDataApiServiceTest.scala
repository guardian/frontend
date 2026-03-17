package services

import conf.IdentityConfiguration
import metadata.MetaDataMatcher.{convertToAnyShouldWrapper, include}
import org.scalatest.EitherValues
import org.mockito.Mockito._
import org.mockito.ArgumentMatchers._
import org.scalatest.flatspec.AsyncFlatSpec
import org.scalatestplus.mockito.MockitoSugar
import play.api.libs.ws.{WSClient, WSRequest, WSResponse}
import play.api.mvc.{Cookie, Cookies}
import play.api.libs.json.Json

import scala.concurrent.Future

class MembersDataApiServiceTest extends AsyncFlatSpec with EitherValues with MockitoSugar {

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
  private val cookies = Cookies(
    Seq(
      Cookie("Cookie1", "hash", None, "/", None, false, true, None),
      Cookie("Cookie2", "hash", None, "/", None, false, true, None),
    ),
  )

  private val wsMock = mock[WSClient]
  private val wsRequestMock = mock[WSRequest]
  private val wsResponseMock = mock[WSResponse]
  private val MdapiService = new MembersDataApiService(wsMock, config)

  when(wsMock.url(any[String])).thenReturn(wsRequestMock)
  when(wsRequestMock.withCookies(any())).thenReturn(wsRequestMock)
  when(wsRequestMock.get()).thenReturn(Future.successful(wsResponseMock))

  "getUserContentAccess" should
    "return ContentAccess data for user with valid cookies" in {
      when(wsResponseMock.json).thenReturn(Json.parse(validMdapiResponseJsonString))
      when(wsResponseMock.status).thenReturn(200)
      when(wsResponseMock.statusText).thenReturn("OK")

      val futureEither = MdapiService.getUserContentAccess(cookies)
      futureEither map { either => either.isRight shouldBe true }
      futureEither map { either => either.value shouldEqual ContentAccess(true, true, false, true, false, true) }
    }

  it should "return MdapiServiceException if unable to extract ContentAccess from json response" in {
    when(wsResponseMock.json).thenReturn(Json.parse(invalidMdapiResponseJsonString))
    when(wsResponseMock.status).thenReturn(200)

    val futureEither = MdapiService.getUserContentAccess(cookies)
    futureEither map { either => either.isLeft shouldBe true }
    futureEither map { either => either.left.value.message should include("Failed to parse MDAPI response") }
  }

  it should "return MdapiServiceException if service returns 404 status" in {
    when(wsResponseMock.json).thenReturn(Json.parse(valid404ResponseJsonString))
    when(wsResponseMock.status).thenReturn(404)
    when(wsResponseMock.statusText).thenReturn("Not Found")

    val futureEither = MdapiService.getUserContentAccess(cookies)
    futureEither map { either => either.isLeft shouldBe true }
    futureEither map { either => either.left.value.message should include("Failed to getUserContentAccess") }
  }

  "ContentAccess.canProceedWithAutoDeletion" should
    "return true when all cases are false" in {
      ContentAccess(false, false, false, false, false, false).canProceedWithAutoDeletion shouldBe true
    }
  it should "return false if any cases are true" in {
    ContentAccess(true, false, false, false, false, false).canProceedWithAutoDeletion shouldBe false
    ContentAccess(false, false, false, false, false, true).canProceedWithAutoDeletion shouldBe false
    ContentAccess(true, false, true, false, true, false).canProceedWithAutoDeletion shouldBe false
    ContentAccess(true, true, true, true, true, true).canProceedWithAutoDeletion shouldBe false
  }

  "ContentAccess.hasSubscription" should
    "return false when all cases are false" in {
      ContentAccess(false, false, false, false, false, false).hasSubscription shouldBe false
    }
  it should "return true if any cases are true" in {
    ContentAccess(false, false, false, true, true, true).hasSubscription shouldBe true
    ContentAccess(false, false, false, false, false, true).hasSubscription shouldBe true
  }
}
