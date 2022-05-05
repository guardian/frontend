package idapiclient

import org.scalatest.concurrent.ScalaFutures
import org.scalatestplus.play.PlaySpec

import scala.concurrent.Future
import org.joda.time.format.ISODateTimeFormat
import idapiclient.parser.IdApiJsonBodyParser
import idapiclient.responses.Error
import org.mockito.Mockito._
import org.mockito.Matchers.any
import org.scalatestplus.mockito.MockitoSugar

import scala.language.postfixOps
import play.api.libs.ws.{WSClient, WSRequest, WSResponse}
import test.{SingleServerSuite, WithTestExecutionContext, WithTestIdConfig}

class IdApiTest
    extends PlaySpec
    with SingleServerSuite
    with MockitoSugar
    with WithTestIdConfig
    with WithTestExecutionContext
    with ScalaFutures {

  val apiRoot = testIdConfig.apiRoot
  val jsonParser = new IdApiJsonBodyParser
  val testUserId = "10000001"

  val validCookieResponseJsonString =
    """
      |{
      |    "status": "ok",
      |    "cookies": {
      |        "values": [
      |            {
      |                "key": "SC_GU_U",
      |                "value": "testCookieValue"
      |            }
      |        ],
      |        "expiresAt": "2018-01-08T15:49:19+00:00"
      |    }
      |}
    """.stripMargin

  val errorCookieResponseJsonString =
    """
      |{
      |    "status": "error",
      |    "errors": [
      |        {
      |            "message": "Invalid email or password",
      |            "description": "The email address or password were incorrect"
      |        }
      |    ]
      |}
    """.stripMargin

  val validUserResponseJsonString =
    s"""
      |{
      |    "status": "ok",
      |    "user": {
      |        "id": "${testUserId}",
      |        "primaryEmailAddress": "test@example.com",
      |        "userGroups": [
      |            {
      |                "packageCode": "CRE",
      |                "path": "/sys/policies/basic-identity"
      |            },
      |            {
      |                "packageCode": "RCO",
      |                "path": "/sys/policies/basic-community"
      |            }
      |        ],
      |        "dates": {
      |            "accountCreatedDate": "2017-09-29T12:25:13Z"
      |        },
      |        "publicFields": {
      |            "username": "testUsername",
      |            "displayName": "testUsername",
      |            "usernameLowerCase": "testusername"
      |        },
      |        "statusFields": {
      |            "userEmailValidated": false
      |        }
      |    }
      |}
    """.stripMargin

  val errors = List(Error("Invalid email or password", "The email address or password were incorrect", 403))

  val trackingParameters = mock[TrackingData]
  when(trackingParameters.parameters).thenReturn(List("tracking" -> "param"))
  when(trackingParameters.ipAddress).thenReturn(None)

  val wsMock = mock[WSClient]
  val wsRequestMock = mock[WSRequest]
  val wsResponseMock = mock[WSResponse]

  when(wsRequestMock.withBody("")).thenReturn(wsRequestMock)
  when(wsRequestMock.withBody("{}")).thenReturn(wsRequestMock)
  when(wsRequestMock.withQueryStringParameters(any[(String, String)])).thenReturn(wsRequestMock)
  when(wsRequestMock.withHttpHeaders(any[(String, String)])).thenReturn(wsRequestMock)
  when(wsRequestMock.withMethod("POST")).thenReturn(wsRequestMock)
  when(wsRequestMock.withMethod("GET")).thenReturn(wsRequestMock)
  when(wsRequestMock.execute()).thenReturn(Future(wsResponseMock))

  when(wsMock.url(any[String])).thenReturn(wsRequestMock)

  val httpClient = new HttpClient(wsMock)

  val idApi = new IdApiClient(jsonParser, testIdConfig, httpClient)

  "authBrowser method" should {
    "returns deserialized CookiesResponse" in {
      when(wsResponseMock.body).thenReturn(validCookieResponseJsonString)
      when(wsResponseMock.status).thenReturn(200)
      when(wsResponseMock.statusText).thenReturn("OK")

      whenReady(idApi.authBrowser(Anonymous, trackingParameters)) {
        case Left(result) => fail("Got Left(%s), instead of expected Right".format(result.toString()))
        case Right(cookiesResponse) => {
          cookiesResponse.expiresAt must equal(
            ISODateTimeFormat.dateTimeNoMillis.parseDateTime("2018-01-08T15:49:19+00:00"),
          )
          val cookies = cookiesResponse.values
          cookies.size must equal(1)
          cookies(0) must have('key ("SC_GU_U"))
          cookies(0) must have('value ("testCookieValue"))
        }
      }
    }

    "returns deserialized Error" in {
      when(wsResponseMock.body).thenReturn(errorCookieResponseJsonString)
      when(wsResponseMock.status).thenReturn(403)
      when(wsResponseMock.statusText).thenReturn("Forbidden")

      whenReady(idApi.authBrowser(Anonymous, trackingParameters)) {
        case Right(result) => fail("Got Right(%s), instead of expected Left".format(result.toString))
        case Left(responseErrors) => {
          responseErrors must equal(errors)
        }
      }
    }
  }

  "user method" should {
    "returns deserialized User" in {
      when(wsResponseMock.body).thenReturn(validUserResponseJsonString)
      when(wsResponseMock.status).thenReturn(200)
      when(wsResponseMock.statusText).thenReturn("OK")

      whenReady(idApi.user(testUserId)) {
        case Left(result) => fail("Got Left(%s), instead of expected Right".format(result.toString()))
        case Right(user) => {
          user must have('id (testUserId))
          user.publicFields must have('username (Some("testUsername")))
          user.primaryEmailAddress mustEqual "test@example.com"
        }
      }
    }
  }
}
