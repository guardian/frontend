package clients

import conf.IdentityConfiguration
import org.mockito.Matchers.any
import org.mockito.Mockito._
import org.scalatest.AsyncFlatSpec
import org.scalatest.Matchers._
import org.scalatest.mockito.MockitoSugar
import play.api.libs.json.Json
import play.api.libs.ws.{WSClient, WSRequest, WSResponse}

import scala.concurrent.Future

class DiscussionClientTest extends AsyncFlatSpec with MockitoSugar {

  private def buildFixtures() =
    new {
      val configMock = mock[IdentityConfiguration]
      val wsClientMock = mock[WSClient]
      val wsRequestMock = mock[WSRequest]
      val wsResponseMock = mock[WSResponse]

      val dapiApiUrl = "https://dapimock.com"
      val testUserId = "10000001"

      val valid404Response =
        """
        |{
        |  "status": "error",
        |  "statusCode": 404,
        |  "message": "No matching user found.",
        |  "errorCode": "USER_NOT_FOUND"
        |}
    """.stripMargin

      val profileStats =
        """
        |{
        |  "status": "ok",
        |  "comments": 10,
        |  "pickedComments": 1
        |}
      """.stripMargin
      val expectedProfileStats = DiscussionProfileStats("ok", 10, 1)

      val userProfile =
        """{
        |  "status": "ok",
        |  "userProfile": {
        |    "userId": "10000001",
        |    "displayName": "displayName"
        |  }
        |}""".stripMargin
      val expectedProfile = DiscussionProfileResponse("ok", DiscussionProfile(testUserId, "displayName"))

      when(configMock.discussionApiUrl).thenReturn(dapiApiUrl)
      when(wsRequestMock.withRequestTimeout(any())).thenReturn(wsRequestMock)
      when(wsRequestMock.get()).thenReturn(Future.successful(wsResponseMock))
    }

  "findProfileStats" should "return user profile stats" in {
    val fixtures = buildFixtures()
    import fixtures._
    val dapiClient = new DiscussionClient(wsClientMock, configMock)

    when(wsResponseMock.status).thenReturn(200)
    when(wsResponseMock.json).thenReturn(Json.parse(profileStats))
    when(wsClientMock.url("https://dapimock.com/profile/10000001/stats")).thenReturn(wsRequestMock)

    dapiClient.findProfileStats(testUserId) map { response =>
      response shouldBe Some(expectedProfileStats)
    }
  }

  "findProfileStats" should "return none for a 404" in {
    val fixtures = buildFixtures()
    import fixtures._
    val dapiClient = new DiscussionClient(wsClientMock, configMock)

    when(wsResponseMock.status).thenReturn(404)
    when(wsResponseMock.json).thenReturn(Json.parse(valid404Response))
    when(wsClientMock.url("https://dapimock.com/profile/10000001/stats")).thenReturn(wsRequestMock)

    dapiClient.findProfileStats(testUserId) map { response =>
      response shouldBe None
    }
  }

  "findProfile" should "find a user profile" in {
    val fixtures = buildFixtures()
    import fixtures._
    val dapiClient = new DiscussionClient(wsClientMock, configMock)

    when(wsResponseMock.status).thenReturn(200)
    when(wsResponseMock.json).thenReturn(Json.parse(userProfile))
    when(wsClientMock.url("https://dapimock.com/profile/10000001")).thenReturn(wsRequestMock)

    dapiClient.findDiscussionUser(testUserId) map { response =>
      response shouldBe Some(expectedProfile)
    }
  }

  "findProfile" should "return None on a 404" in {
    val fixtures = buildFixtures()
    import fixtures._
    val dapiClient = new DiscussionClient(wsClientMock, configMock)

    when(wsResponseMock.status).thenReturn(404)
    when(wsResponseMock.json).thenReturn(Json.parse(valid404Response))
    when(wsClientMock.url("https://dapimock.com/profile/10000001")).thenReturn(wsRequestMock)

    dapiClient.findDiscussionUser(testUserId) map { response =>
      response shouldBe None
    }
  }

}
