package services

import conf.IdentityConfiguration
import org.mockito.Matchers.any
import org.mockito.Mockito._
import org.scalatest.Matchers._
import org.scalatest.mockito.MockitoSugar
import org.scalatest.{AsyncFlatSpec, EitherValues}
import play.api.libs.ws.{WSClient, WSRequest, WSResponse}
import scala.concurrent.Future
import play.api.libs.json.Json

class DiscussionApiServiceTest extends AsyncFlatSpec
                               with EitherValues
                               with MockitoSugar {

  private val configMock = mock[IdentityConfiguration]
  private val wsClientMock = mock[WSClient]
  private val wsRequestMock = mock[WSRequest]
  private val wsResponseMock = mock[WSResponse]
  private val dapiService = new DiscussionApiService(wsClientMock, configMock)

  val dapiApiUrl = "https://dapimock.com"
  val testUserId = "10000001"

  val valid404Response =
    """
      |{
      |"status": "error",
      |"statusCode": 404,
      |"message": "No matching user found.",
      |"errorCode": "USER_NOT_FOUND"
      |}
    """.stripMargin

  val validDapiResponseWithComments =
    """
      |{
      |"status": "ok",
      |"comments": 10,
      |"pickedComments": 1
      |}
    """.stripMargin

  val validDapiResponseWithOutComments =
    """
      |{
      |"status": "ok",
      |"comments": 0,
      |"pickedComments": 0
      |}
    """.stripMargin

  val invalidDapiProfileStatsResponse =
    """
      |{
      |"status": "ok",
      |"pickedComments": 0
      |}
    """.stripMargin

  val validDapiResponseProfileStatsResponseWithErrorInComments =
    """
      |{
      |"status": "ok",
      |"comments": -5,
      |"pickedComments": 0
      |}
    """.stripMargin

  when(configMock.discussionApiUrl).thenReturn(dapiApiUrl)
  when(wsClientMock.url(any[String])).thenReturn(wsRequestMock)
  when(wsRequestMock.withRequestTimeout(any())).thenReturn(wsRequestMock)
  when(wsRequestMock.get()).thenReturn(Future.successful(wsResponseMock))

  "userHasPublicProfile" should
  "return True for a user with valid user id who has commented" in {
    when(wsResponseMock.status).thenReturn(200)
    when(wsResponseMock.json).thenReturn(Json.parse(validDapiResponseWithComments))

    dapiService.userHasPublicProfile(testUserId).value map { response =>
      response shouldBe Right(true)}
  }

  it should "return False for a user with a valid user id who is in Discussion but has never commented" in {
    when(wsResponseMock.status).thenReturn(200)
    when(wsResponseMock.json).thenReturn(Json.parse(validDapiResponseWithOutComments))

    dapiService.userHasPublicProfile(testUserId).value map { response =>
      response shouldBe Right(false)}
  }

  it should "return a DiscussionApiServiceException for a user who is not found in Discussion" in {
    when(wsResponseMock.status).thenReturn(404)
    when(wsResponseMock.json).thenReturn(Json.parse(valid404Response))

    dapiService.userHasPublicProfile(testUserId).value map { response =>
      response shouldBe Left(DiscussionApiServiceException("404: User not found in Discussion"))}
  }

  it should "return a DiscussionApiServiceException for an invalid Profile Stats response from Discussion" in {
    when(wsResponseMock.status).thenReturn(200)
    when(wsResponseMock.json).thenReturn(Json.parse(invalidDapiProfileStatsResponse))

    dapiService.userHasPublicProfile(testUserId).value map { response =>
      response shouldBe Left(DiscussionApiServiceException("Error validating user profile stats response"))}
  }

  it should "return a False for a user with negative comment number in Profile Stats response from Discussion" in {
    when(wsResponseMock.status).thenReturn(200)
    when(wsResponseMock.json).thenReturn(Json.parse(validDapiResponseProfileStatsResponseWithErrorInComments))

    // Comments value must be greater than 0
    dapiService.userHasPublicProfile(testUserId).value map { response =>
      response shouldBe Right(false)}
  }

}
