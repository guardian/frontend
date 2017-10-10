package idapiclient

import org.scalatest.mockito.MockitoSugar
import org.scalatest.concurrent.ScalaFutures
import org.scalatestplus.play.PlaySpec
import org.mockito.Mockito._
import mockws.{MockWS, MockWSHelpers}
import scala.concurrent.ExecutionContext
import org.joda.time.format.ISODateTimeFormat
import conf.IdConfig
import idapiclient.parser.{IdApiJsonBodyParser, JsonBodyParser}
import idapiclient.responses.Error
import scala.language.postfixOps
import play.api.libs.ws.WSClient
import test.{SingleServerSuite, WithTestExecutionContext, WithTestIdConfig}
import play.api.mvc.Results._
import play.api.test.Helpers._

class IdApiTest
    extends PlaySpec
      with SingleServerSuite
      with MockitoSugar
      with WithTestIdConfig
      with MockWSHelpers
      with WithTestExecutionContext
      with ScalaFutures {

  class IdApiTestClient(
    jsonParser: JsonBodyParser,
    conf: IdConfig,
    wsClient: WSClient)
    (implicit val executionContext: ExecutionContext)
    extends IdApi(jsonParser, conf, wsClient)

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
      |            "vanityUrl": "testVanityUrl",
      |            "usernameLowerCase": "testusername"
      |        },
      |        "statusFields": {
      |            "allowThirdPartyProfiling": true,
      |            "userEmailValidated": false
      |        }
      |    }
      |}
    """.stripMargin


  val postAuthUrl = s"$apiRoot/auth"
  val postUnauthUrl = s"$apiRoot/unauth"
  val getUserUrl = s"$apiRoot/user/$testUserId"

  val wsClientOk = MockWS {
    case (POST, `postAuthUrl`) => Action { Ok(validCookieResponseJsonString) }
    case (POST, `postUnauthUrl`) => Action { Ok(validCookieResponseJsonString) }
    case (GET, `getUserUrl`) => Action { Ok(validUserResponseJsonString) }
  }

  val wsClientError = MockWS {
    case (POST, `postAuthUrl`) => Action { Forbidden(errorCookieResponseJsonString) }
    case (POST, `postUnauthUrl`) => Action { Forbidden(errorCookieResponseJsonString) }
  }

  val apiOk = new IdApiTestClient(jsonParser, testIdConfig, wsClientOk)
  val apiError = new IdApiTestClient(jsonParser, testIdConfig, wsClientError)

  val errors = List(Error("Invalid email or password", "The email address or password were incorrect", 403))

  val trackingParameters = mock[TrackingData]
  when(trackingParameters.parameters).thenReturn(List("tracking" -> "param"))
  when(trackingParameters.ipAddress).thenReturn(None)

  "authBrowser method" should {
    "returns deserialized CookiesResponse" in {
      whenReady(apiOk.authBrowser(Anonymous, trackingParameters)) {
        case Left(result) => fail("Got Left(%s), instead of expected Right".format(result.toString()))
        case Right(cookiesResponse) => {
          cookiesResponse.expiresAt must equal(ISODateTimeFormat.dateTimeNoMillis.parseDateTime("2018-01-08T15:49:19+00:00"))
          val cookies = cookiesResponse.values
          cookies.size must equal(1)
          cookies(0) must have('key("SC_GU_U"))
          cookies(0) must have('value("testCookieValue"))
        }
      }
    }

    "returns deserialized Error" in {
      whenReady(apiError.authBrowser(Anonymous, trackingParameters)) {
        case Right(result) => fail("Got Right(%s), instead of expected Left".format(result.toString))
        case Left(responseErrors) => {
          responseErrors must equal(errors)
        }
      }
    }
  }

  "unauth method" should {
    "returns deserialized CookiesResponse" in {
      whenReady(apiOk.unauth(Anonymous, trackingParameters)) {
        case Left(result) => fail("Got Left(%s), instead of expected Right".format(result.toString()))
        case Right(cookiesResponse) => {
          cookiesResponse.expiresAt must equal(ISODateTimeFormat.dateTimeNoMillis.parseDateTime("2018-01-08T15:49:19+00:00"))
          val cookies = cookiesResponse.values
          cookies.size must equal(1)
          cookies(0) must have('key ("SC_GU_U"))
          cookies(0) must have('value ("testCookieValue"))
        }
      }
    }

    "returns CookiesResponse Error" in {
      whenReady(apiError.unauth(Anonymous, trackingParameters)) {
        case Right(result) => fail("Got Right(%s), instead of expected Left".format(result.toString))
        case Left(responseErrors) => {
          responseErrors must equal(errors)
        }
      }
    }
  }

  "user method" should {
    "returns deserialized User" in {
      whenReady(apiOk.user(testUserId)) {
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
