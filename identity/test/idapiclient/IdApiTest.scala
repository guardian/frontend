package idapiclient

import org.scalatest.path
import org.scalatest.mock.MockitoSugar
import org.scalatest.{Matchers => ShouldMatchers}
import org.mockito.Mockito._
import org.mockito.Matchers.argThat
import org.mockito.Matchers
import client.connection.{HttpResponse, Http}
import client.parser.{JodaJsonSerializer, JsonBodyParser}
import scala.concurrent.{Await, Future, Promise, ExecutionContext}
import client.{Error, Anonymous, Auth, Parameters, Response}
import org.hamcrest.Description
import org.mockito.ArgumentMatcher
import org.joda.time.DateTime
import client.connection.util.ExecutionContexts

import org.joda.time.format.ISODateTimeFormat
import com.gu.identity.model._
import net.liftweb.json.Serialization.write
import scala.concurrent.duration._
import scala.language.postfixOps
import net.liftweb.json.JsonAST.JValue
import net.liftweb.json.Formats

class IdApiTest extends path.FreeSpec with ShouldMatchers with MockitoSugar {
  implicit def executionContext: ExecutionContext = ExecutionContexts.currentThreadContext

  implicit val formats = LiftJsonConfig.formats + new JodaJsonSerializer

  val fmt = ISODateTimeFormat.dateTimeNoMillis()

  val apiRoot = "http://example.com/"
  val http = mock[Http]
  val jsonParser = new JsonBodyParser {
    implicit val formats: Formats = LiftJsonConfig.formats + new JodaJsonSerializer

    def extractErrorFromResponse(json: JValue, statusCode: Int) = ???
  }
  val clientAuth = ClientAuth("clientAccessToken")
  val clientAuthHeaders = List("X-GU-ID-Client-Access-Token" -> "Bearer clientAccessToken")
  val api = new SynchronousIdApi(apiRoot, http, jsonParser, clientAuth)
  val errors = List(Error("Test error", "Error description", 500))
  val trackingParameters = mock[TrackingData]
  when(trackingParameters.parameters).thenReturn(List("tracking" -> "param"))
  when(trackingParameters.ipAddress).thenReturn(None)

  "the authBrowser method" - {
    "given a valid response" - {
      val validCookieResponse = HttpResponse( """{"expiresAt": "2013-10-30T12:21:00+00:00", "values": [{"name": testName", "value": "testValue"}]}""", 200, "OK")
      when(http.POST(Matchers.any[String], Matchers.any[Option[String]], Matchers.any[Parameters], Matchers.any[Parameters]))
        .thenReturn(toFuture(Right(validCookieResponse)))

      "accesses the /auth endpoint" in {
        api.authBrowser(Anonymous, trackingParameters)
        verify(http).POST(Matchers.eq("http://example.com/auth"), Matchers.any[Option[String]], Matchers.any[Parameters], Matchers.any[Parameters])
      }

      "adds the cookie parameter to the request" in {
        api.authBrowser(Anonymous, trackingParameters)
        verify(http).POST(Matchers.eq("http://example.com/auth"), Matchers.any[Option[String]], argThat(new ParamsIncludes(Iterable(("format", "cookies")))), Matchers.any[Parameters])
      }

      "adds the client access token parameter to the request" in {
        api.authBrowser(Anonymous, trackingParameters)
        verify(http).POST(Matchers.eq("http://example.com/auth"), Matchers.any[Option[String]], Matchers.any[Parameters], argThat(new ParamsIncludes(clientAuthHeaders)))
      }

      "passes the auth header to the http lib's GET method" in {
        val auth = TestAuth(Iterable.empty, List(("testHeader", "value")))
        api.authBrowser(auth, trackingParameters)
        verify(http).POST(Matchers.any[String], Matchers.any[Option[String]], argThat(new ParamsIncludes(Iterable(("format", "cookies")))), argThat(new ParamsIncludes(Iterable(("testHeader", "value")))))
      }

      "passes the parameters to the http lib's POST body" in {
        val auth = EmailPassword("email@test.com", "password", None)
        val jsonBody = Option(write(auth))
        api.authBrowser(auth, trackingParameters)
        verify(http).POST(Matchers.any[String], Matchers.eq(jsonBody), argThat(new ParamsIncludes(Iterable(("format", "cookies")))),  Matchers.any[Parameters])
      }

      "returns a cookies response" in {
        api.authBrowser(Anonymous, trackingParameters).map {
          case Left(result) => fail("Got Left(%s), instead of expected Right".format(result.toString()))
          case Right(cookiesResponse) => {
            cookiesResponse.expiresAt should equal(ISODateTimeFormat.dateTimeNoMillis.parseDateTime("2013-10-30T12:21:00+00:00"))
            val cookies = cookiesResponse.values
            cookies.size should equal(1)
            cookies(0) should have('name("testName"))
            cookies(0) should have('value("testValue"))
          }
        }
      }
    }

    "given an error" - {
      when(http.POST(Matchers.any[String], Matchers.any[Option[String]], Matchers.any[Parameters], Matchers.any[Parameters]))
        .thenReturn(toFuture(Left(errors)))

      "returns the errors" in {
        api.authBrowser(Anonymous, trackingParameters).map {
          case Right(result) => fail("Got Right(%s), instead of expected Left".format(result.toString))
          case Left(responseErrors) => {
            responseErrors should equal(errors)
          }
        }
      }
    }
  }

  "the unauth method" - {
    "given a valid response " - {
      val validCookieResponse = HttpResponse( """{"expiresAt": "2013-10-30T12:21:00+00:00", "values": [{"name": testName", "value": "testValue"}]}""", 200, "OK")
      when(http.POST(Matchers.any[String], Matchers.any[Option[String]], Matchers.any[Parameters], Matchers.any[Parameters]))
        .thenReturn(toFuture(Right(validCookieResponse)))

      "accesses the unauth endpoint" in {
        api.unauth(Anonymous, trackingParameters)
        verify(http).POST(Matchers.eq("http://example.com/unauth"), Matchers.any[Option[String]], Matchers.any[Parameters], Matchers.any[Parameters])
      }

      "adds the client access token parameter to the request" in {
        api.unauth(Anonymous, trackingParameters)
        verify(http).POST(Matchers.eq("http://example.com/unauth"), Matchers.any[Option[String]], Matchers.any[Parameters], argThat(new ParamsIncludes(Iterable(("X-GU-ID-Client-Access-Token", "Bearer clientAccessToken")))))
      }
      "passes the auth parameters to the http lib's GET method" in {
        val auth = TestAuth(List(("testParam", "value")), Iterable.empty)
        api.unauth(auth, trackingParameters)
        verify(http).POST(Matchers.any[String], Matchers.any[Option[String]], Matchers.any[Parameters], argThat(new ParamsIncludes(Iterable(("X-GU-ID-Client-Access-Token", "Bearer clientAccessToken")))))
      }

      "passes the auth header to the http lib's GET method" in {
        val auth = TestAuth(Iterable.empty, List(("testHeader", "value")))
        api.unauth(auth, trackingParameters)
        verify(http).POST(Matchers.any[String], Matchers.any[Option[String]], Matchers.any[Parameters], argThat(new ParamsIncludes(Iterable(("testHeader", "value")))))
      }

      "returns a cookies response" in {
        api.unauth(Anonymous, trackingParameters).map(_ match {
          case Left(result) => fail("Got Left(%s), instead of expected Right".format(result.toString()))
          case Right(cookiesResponse) => {
            cookiesResponse.expiresAt should equal(ISODateTimeFormat.dateTimeNoMillis.parseDateTime("2013-10-30T12:21:00+00:00"))
            val cookies = cookiesResponse.values
            cookies.size should equal(1)
            cookies(0) should have('name("testName"))
            cookies(0) should have('value("testValue"))
          }
        })
      }

      "given an error" - {
        when(http.POST(Matchers.any[String], Matchers.any[Option[String]], Matchers.any[Parameters], Matchers.any[Parameters]))
          .thenReturn(toFuture(Left(errors)))

        "returns the errors" in {
          api.unauth(Anonymous, trackingParameters).map(_ match {
            case Right(result) => fail("Got Right(%s), instead of expected Left".format(result.toString))
            case Left(responseErrors) => {
              responseErrors should equal(errors)
            }
          })
        }
      }


    }
  }


  "the user method" - {
    "when receiving a valid response" - {
      val userJSON = """{"id": "123", "primaryEmailAddress": "test@example.com", "publicFields": {"displayName": "displayName", "username": "Username", "usernameLowerCase": "username", "vanityUrl": "vanityUrl"}}"""
      val validUserResponse = HttpResponse(userJSON, 200, "OK")
      when(http.GET(Matchers.any[String], Matchers.any[Parameters], Matchers.any[Parameters]))
        .thenReturn(toFuture(Right(validUserResponse)))

      "accesses the user endpoint with the user's id" in {
        api.user("123")
        verify(http).GET("http://example.com/user/123", Iterable.empty, clientAuthHeaders)
      }

      "returns the user object" in {
        api.user("123").map {
          case Left(result) => fail("Got Left(%s), instead of expected Right".format(result.toString()))
          case Right(user) => {
            user should have('id("123"))
            user.publicFields should have('displayName("displayName"))
            user.publicFields should have('username("Username"))
            user.publicFields should have('usernameLowerCase("username"))
            user.publicFields should have('vanityUrl("vanityUrl"))
            user.primaryEmailAddress should have('priomaryEmailAddress("test@example.com"))
          }
        }
      }

      "when providing authentication to the request" - {
        "adds the url parameters" in {
          api.user("123", ParamAuth)
          verify(http).GET(Matchers.any[String], Matchers.argThat(new ParamsMatcher(Iterable("testParam" -> "value"))), Matchers.argThat(new ParamsMatcher(clientAuthHeaders)))
        }

        "adds the request headers" in {
          api.user("123", HeaderAuth)
          verify(http).GET(Matchers.any[String], Matchers.eq(Nil), argThat(new ParamsMatcher(Iterable("testHeader" -> "value") ++ clientAuthHeaders)))
        }
      }
    }

    "when receiving an error response" - {
      when(http.GET(Matchers.any[String], Matchers.any[Parameters], Matchers.any[Parameters]))
        .thenReturn(toFuture(Left(errors)))

      "returns the errors" in {
        api.user("123").map {
          case Right(result) => fail("Got Right(%s), instead of expected Left".format(result.toString))
          case Left(responseErrors) => {
            responseErrors should equal(errors)
          }
        }
      }
    }
  }


  "the prefs method" - {
      val userPrefsJSON = """{"status":ok","savedArticles":{"version":"1418141910657","articles":[{"id":"world/2014/oct/11/thailand-murders-hannah-witheridge-david-miller-police-say-concrete-evidence-links-burmese-suspects","shortUrl":"http://gu.com/p/42c5t","date":"2014-10-11T12:09:07Z","read":false},{"id":"technology/2014/oct/12/teenagers-snapchat-images-leaked-internet","shortUrl":"http://gu.com/p/42cg4","date":"2014-10-14T06:39:36Z","read":false}]}}"""
      val validUserPrefsResponse = HttpResponse(userPrefsJSON, 200, "OK")
      when(http.GET(Matchers.any[String], Matchers.any[Parameters], Matchers.any[Parameters]))
      .thenReturn(toFuture(Right(validUserPrefsResponse)))

    "when recieving a valid response" - {
      "accesses the synced prefs endpoint with the users id" in {
          api.savedArticles(Anonymous)
          verify(http).GET("http://example.com/syncedPrefs/me/savedArticles", Iterable.empty, clientAuthHeaders)
        }

       "returns the synced Prefs Ofbject " in {
         api.savedArticles(Anonymous) map {
            case Left(result) => fail("Got Right (%s), instead of expect Right".format(result.toString) )
            case Right(prefs) => {
              prefs.version should be ("10010871")
              prefs.articles map {
                savedArticle =>
                  savedArticle should have ('id("world/2014/oct/11/thailand-murders-hannah-witheridge-david-miller-police-say-concrete-evidence-links-burmese-suspects"))
                  savedArticle should have ('shortUrl("http://gu.com/p/42c5t"))
                  savedArticle should have ('date("2014-10-14T06:39:36Z"))
              } orElse(fail("did not get expected articles"))

            }
         }
       }
    }

    "when provididinmg authentication to the request" - {
      "adds the url paremeters" in  {
        api.savedArticles(ParamAuth)
        verify(http).GET(Matchers.any[String], argThat(new ParamsMatcher(Iterable("testParam" -> "value"))), Matchers.argThat(new ParamsMatcher(clientAuthHeaders)))
      }

      "adds the headers" in {
        api.savedArticles(HeaderAuth)
        verify(http).GET(Matchers.any[String], Matchers.eq(Nil), argThat(new ParamsMatcher(Iterable("testHeader" -> "value") ++ clientAuthHeaders)))
      }
    }

    "when recieving an error response" - {
      when(http.GET(Matchers.any[String], Matchers.any[Parameters], Matchers.any[Parameters]))
        .thenReturn(toFuture(Left(errors)))

      "returns the errors" in {
        api.savedArticles(Anonymous).map {
          case Right(result) => fail("Got Right(%s), instead of expected Left".format(result.toString))
          case Left(responseErrors) => {
            responseErrors should equal(errors)
          }
        }
      }

    }
  }


  "the userForToken method " - {
    val token = "atoken"
    "when recieving a valid response" - {
      val userJSON = """{"status" : "ok", "user":{"id": "123", "primaryEmailAddress": "test@example.coma", "publicFields": {"displayName": "displayName", "username": "Username", "usernameLowerCase": "username", "vanityUrl": "vanityUrl"}}}"""
      val validUserResponse = HttpResponse(userJSON, 200, "OK")
      when(http.GET(Matchers.any[String], Matchers.any[Parameters], Matchers.any[Parameters])).thenReturn(toFuture(Right(validUserResponse)))
      "accesses the get user for token with the token param" in {
        api.userForToken(token)
        verify(http).GET(Matchers.eq("http://example.com/pwd-reset/user-for-token"), argThat(new ParamsIncludes(Iterable(("token", token)))), Matchers.argThat(new ParamsIncludes(clientAuthHeaders)))
      }

      "returns the user object" in {
        api.userForToken(token).map {
          case Left(result) => fail("Got Left(%s), instead of expected Right".format(result.toString()))
          case Right(user) => {
            user should have('id("123"))
            user.publicFields should have('displayName("displayName"))
            user.publicFields should have('username("Username"))
            user.publicFields should have('usernameLowerCase("username"))
            user.publicFields should have('vanityUrl("vanityUrl"))
            user.primaryEmailAddress should have('priomaryEmailAddress("test@example.com"))
          }
        }
      }
    }
    "when receiving an error response" - {
      when(http.GET(Matchers.any[String], Matchers.any[Parameters], Matchers.any[Parameters]))
        .thenReturn(toFuture(Left(errors)))

      "returns the errors" in {
        api.userForToken(token).map {
          case Right(result) => fail("Got Right(%s), instead of expected Left".format(result.toString()))
          case Left(responseErrors) => {
            responseErrors should equal(errors)
          }
        }
      }
    }
  }

  "the reset password method" - {

    val token = "atoken"
    val newPassword = "anewpassword"

    val requestJson = """{"token":"%s","password":"%s"}""".format(token, newPassword)
    "when recieving a valid response" - {
      val validResponse = HttpResponse( """{"status" : "ok" }""", 200, "OK")
      when(http.POST(Matchers.any[String], Matchers.any[Option[String]], Matchers.any[Parameters], Matchers.any[Parameters])).thenReturn(toFuture(Right(validResponse)))

      "posts the request json data to the endpoint" in {
        api.resetPassword(token, newPassword)
        verify(http).POST(Matchers.eq("http://example.com/pwd-reset/reset-pwd-for-user"), Matchers.eq(Option(requestJson)), Matchers.eq(Nil), Matchers.eq(clientAuthHeaders))
      }

      "returns a successful unit response" in {
        api.resetPassword(token, newPassword).map {
          case Left(result) => fail("Got Left(%s), instead of expected Right".format(result.toString()))
          case Right(_: Unit) => {
          }
        }
      }
    }

    "when recieving an error response" - {
      when(http.POST(Matchers.any[String], Matchers.any[Option[String]], Matchers.any[Parameters], Matchers.any[Parameters])).thenReturn(toFuture(Left(errors)))
      "returns the errors" in {
        api.resetPassword(token, newPassword).map {
          case Right(ok) => fail("Got right(%s) instead of expected left".format(ok.toString))
          case Left(responseErrors) => {
            responseErrors should equal(errors)
          }
        }
      }
    }

  }

  "the add article to save list" - {
    val id = "world/2014/oct/11/thailand-murders-hannah-witheridge-david-miller-police-say-concrete-evidence-links-burmese-suspects"
    val shortUrl = "http://gu.com/p/42c5t"
    val date  = new DateTime(2014,10,11,12,0,0)//"2014-10-11T12:00:007Z"
    val version = "1418141910657"

    val requestJson = """{"version":"1418141910657","articles":[{"id":"%s","shortUrl":"%s","date":"%s","read":false}]}""".format(id, shortUrl, fmt.print(date))
    val articles = List(SavedArticle(id, shortUrl, date, false, None))
    val savedArticles = SavedArticles(version, articles)

    "when recieving a valid response" - {
      val validResponse = HttpResponse( """{"status" : "ok" }""", 200, "OK")
      when(http.POST(Matchers.any[String], Matchers.any[Option[String]], Matchers.any[Parameters], Matchers.any[Parameters])).thenReturn(toFuture(Right(validResponse)))

      "accesses the savedArticles endpoing" in {
        api.updateSavedArticles(Anonymous, savedArticles)
        verify(http).POST(Matchers.eq("http://example.com/syncedPrefs/me/savedArticles"), Matchers.any[Option[String]], Matchers.any[Parameters], Matchers.any[Parameters])
      }

      "passes the updated articles list as json to the endpoint" in  {
        api.updateSavedArticles(Anonymous, savedArticles)
        verify(http).POST(Matchers.any[String], Matchers.eq(Option(requestJson)), Matchers.any[Parameters], Matchers.any[Parameters])
      }

      "adds the client access token parameter to the request" in {
        api.updateSavedArticles(Anonymous, savedArticles)
        verify(http).POST(Matchers.any[String], Matchers.eq(Option(requestJson)), Matchers.any[Parameters], argThat(new ParamsIncludes(clientAuthHeaders)))
      }

      "adds the headers to the request" in {
        api.updateSavedArticles(HeaderAuth, savedArticles)
        verify(http).POST(Matchers.any[String], Matchers.eq(Option(requestJson)), Matchers.any[Parameters], argThat(new ParamsMatcher(Iterable("testHeader" -> "value") ++ clientAuthHeaders)))
      }
    }

    "when recieving an error response" - {
      when(http.POST(Matchers.any[String], Matchers.any[Option[String]], Matchers.any[Parameters], Matchers.any[Parameters])).thenReturn(toFuture(Left(errors)))
      "returns the errors" in {
        api.updateSavedArticles(Anonymous, savedArticles) map {
          case Right(ok) => fail("Got right(%s) instead of expected left".format(ok.toString))
          case Left(responseErrors) => {
            responseErrors should equal(errors)
          }
        }
      }
    }
  }



  "the password exists endpoint" - {
    def validResponse(result: Boolean) = HttpResponse( s"""{"passwordExists": ${result}}""", 200, "OK")


    "when receiving a valid 'true' response" - {
      when(http.GET(Matchers.any[String], Matchers.any[Parameters], Matchers.any[Parameters])).thenReturn(toFuture(Right(validResponse(true))))

      "should call the correct URL" in {
        Await.result(api.passwordExists(ParamAuth), 10 seconds)
        verify(http).GET(Matchers.eq("http://example.com/user/password-exists"), Matchers.any[Parameters], Matchers.any[Parameters])
      }

      "then the correct value should be returned" in {
        val result = api.passwordExists(ParamAuth)
        Await.result(result, 10 seconds) should be(Right(true))
      }
    }

    "when receiving a valid 'false' response" - {
      when(http.GET(Matchers.any[String], Matchers.any[Parameters], Matchers.any[Parameters])).thenReturn(toFuture(Right(validResponse(false))))

      "then the correct value should be returned" in {
        val result = api.passwordExists(ParamAuth)
        Await.result(result, 10 seconds) should be(Right(false))
      }
    }
  }

  "the send password reset email" - {
    val testEmail = "test@example.com"
    "when receiving a valid response" - {
      val myUserJSON = """{"id": "1234", "primaryEmailAddress": "test@example.com", "publicFields": {"displayName": "displayName", "username": "Username", "usernameLowerCase": "username", "vanityUrl": "vanityUrl"}}"""
      val validResponse = HttpResponse(myUserJSON, 200, "OK")
      when(http.GET(Matchers.any[String], Matchers.any[Parameters], Matchers.any[Parameters])).thenReturn(toFuture(Right(validResponse)))

      "accesses the reset password endpoint" in {
        api.sendPasswordResetEmail(testEmail, trackingParameters)
        verify(http).GET(Matchers.eq("http://example.com/pwd-reset/send-password-reset-email"), Matchers.anyObject(), Matchers.anyObject())
      }

      "adds the email address and type parameters" in {
        api.sendPasswordResetEmail(testEmail, trackingParameters)
        verify(http).GET(Matchers.eq("http://example.com/pwd-reset/send-password-reset-email"), Matchers.argThat(new ParamsIncludes(Iterable(("email-address", testEmail), ("type", "reset")))), Matchers.argThat(new ParamsIncludes(clientAuthHeaders)))
      }

      "returns an user object" in {
        api.sendPasswordResetEmail(testEmail, trackingParameters).map {
          case Left(error) => fail("Got left(%s), instead of expected Right".format(error.toString()))
          case Right(_: Unit) => {
          }
        }
      }

      "when recieving an error response" - {
        when(http.POST(Matchers.any[String], Matchers.any[Option[String]], Matchers.any[Parameters], Matchers.any[Parameters])).thenReturn(toFuture(Left(errors)))
        "returns the errors" in {
          api.sendPasswordResetEmail(testEmail, trackingParameters).map {
            case Right(user) => fail("Got right(%s) instead of expected left".format(user.toString))
            case Left(responseErrors) => {
              responseErrors should equal(errors)
            }
          }
        }
      }

      "passes the client IP to the API" in {
        when(trackingParameters.ipAddress).thenReturn(Some("123.456.789.10"))
        api.sendPasswordResetEmail(testEmail, trackingParameters)
        verify(http).GET(Matchers.anyString(), Matchers.argThat(new ParamsIncludes(Iterable("ip" -> "123.456.789.10"))), Matchers.anyObject())
      }
    }
  }

  "the me method" - {
    "when receiving a valid response" - {
      val myUserJSON = """{"id": "1234", "primaryEmailAddress": "test@example.coma", "publicFields": {"displayName": "displayName", "username": "Username", "usernameLowerCase": "username", "vanityUrl": "vanityUrl"}}"""
      val validUserResponse = HttpResponse(myUserJSON, 200, "OK")
      when(http.GET(Matchers.any[String], Matchers.any[Parameters], Matchers.any[Parameters]))
        .thenReturn(toFuture(Right(validUserResponse)))

      "accesses the user endpoint with me in place of the user id" in {
        api.me(Anonymous)
        verify(http).GET(Matchers.eq("http://example.com/user/me"), Matchers.any[Parameters], Matchers.any[Parameters])
      }

      "passes the authentication to the API" in {
        api.me(TestAuth(List("foo" -> "123"), List("bar" -> "456")))
        verify(http).GET(Matchers.any[String], Matchers.argThat(new ParamsMatcher(List("foo" -> "123"))), Matchers.argThat(new ParamsMatcher(List("bar" -> "456") ++ clientAuthHeaders)))
      }

      "returns the user object" in {
        api.me(Anonymous).map {
          case Left(result) => fail("Got Left(%s), instead of expected Right".format(result.toString()))
          case Right(user) => {
            user should have('id("1234"))
            user.publicFields should have('displayName("displayName"))
            user.publicFields should have('username("Username"))
            user.publicFields should have('usernameLowerCase("username"))
            user.publicFields should have('vanityUrl("vanityUrl"))
            user.primaryEmailAddress should have('priomaryEmailAddress("test@example.com"))
          }
        }
      }
    }

    "when receiving an error response" - {
      when(http.GET(Matchers.any[String], Matchers.any[Parameters], Matchers.any[Parameters]))
        .thenReturn(toFuture(Left(errors)))

      "returns the errors" in {
        api.me(Anonymous).map {
          case Right(result) => fail("Got Right(%s), instead of expected Left".format(result.toString))
          case Left(responseErrors) => {
            responseErrors should equal(errors)
          }
        }
      }
    }
  }

  "the register method" - {
    val user = User(
      primaryEmailAddress = "test@example.com",
      password = Some("password"),
      publicFields = PublicFields(username = Some("username")),
      statusFields = StatusFields(
        receiveGnmMarketing = Option(false),
        receive3rdPartyMarketing = Option(false)
      )
    )

    "when receiving a valid response" - {

      val expectedPostData = write(user)
      val userJSON = """{"id": "1234", "primaryEmailAddress": "test@example.com", "publicFields": {"displayName": "displayName", "username": "Username", "usernameLowerCase": "username", "vanityUrl": "vanityUrl"}}"""
      val validUserResponse = HttpResponse(userJSON, 200, "OK")
      when(http.POST(Matchers.any[String], Matchers.any[Option[String]], Matchers.any[Parameters], Matchers.any[Parameters])).thenReturn(toFuture(Right(validUserResponse)))


      "accesses the user endpoint" in {
        api.register(user, trackingParameters)
        verify(http).POST(Matchers.eq("http://example.com/user"), Matchers.any[Option[String]], Matchers.any[Parameters], Matchers.any[Parameters])
      }

      "adds the client access token parameter to the request" in {
        api.register(user, trackingParameters)
        verify(http).POST(Matchers.eq("http://example.com/user"), Matchers.any[Option[String]], Matchers.any[Parameters], argThat(new ParamsIncludes(clientAuthHeaders)))
      }

      "adds the the omniture tracking data to the request" in {
        api.register(user, trackingParameters)
        verify(http).POST(Matchers.eq("http://example.com/user"), Matchers.any[Option[String]], argThat(new ParamsIncludes(Iterable("tracking" -> "param"))), Matchers.any[Parameters])
      }

      "posts the user data to the endpoint" in {
        api.register(user, trackingParameters)
        verify(http).POST(Matchers.any[String], Matchers.eq(Some(expectedPostData)), Matchers.any[Parameters], Matchers.any[Parameters])
      }

      "passes the user's IP details as provided" in {
        when(trackingParameters.ipAddress).thenReturn(Some("127.0.0.1"))
        api.register(user, trackingParameters)
        verify(http).POST(Matchers.any[String], Matchers.eq(Some(expectedPostData)), Matchers.any[Parameters], argThat(new ParamsIncludes(Iterable("X-Forwarded-For" -> "127.0.0.1"))))
      }
    }

    "when recieving an error response" - {
      when(http.POST(Matchers.any[String], Matchers.any[Option[String]], Matchers.any[Parameters], Matchers.any[Parameters]))
        .thenReturn(toFuture(Left(errors)))
      "returns the errors" - {
        api.register(user, trackingParameters).map {
          case Right(result) => fail("Got Right(%s), instead of expected Left".format(result.toString))
          case Left(responseErrors) => {
            responseErrors should equal(errors)
          }
        }
      }
    }

  }

  "synchronous version" - {
    val syncApi = new SynchronousIdApi(apiRoot, http, jsonParser, clientAuth)

    "should use current thread context" in {
      syncApi.executionContext should equal(ExecutionContexts.currentThreadContext)
    }
  }

  def toFuture(response: Response[HttpResponse]) = Promise.successful(response).future

  case class TestAuth(override val parameters: Parameters, override val headers: Parameters) extends Auth

  object ParamAuth extends TestAuth(Iterable(("testParam", "value")), Iterable.empty)

  object HeaderAuth extends TestAuth(Iterable.empty, Iterable(("testHeader", "value")))

  class ParamsMatcher(items: Iterable[(String, String)], completeMatch: Boolean = true) extends ArgumentMatcher {
    override def matches(arg: Any): Boolean = {
      arg match {
        case list: Iterable[_] => {
          val params = list.asInstanceOf[Iterable[(String, String)]]
          items.forall(param => params.exists(_ == param)) && (if (completeMatch) list.size == items.size else true)
        }
        case _ => false
      }
    }

    override def describeTo(description: Description): Unit = {
      description.appendText("Iterable" + (if (!completeMatch) " including" else "") + items.mkString("(", ",", ")"))
    }
  }

  object EmptyParamMatcher extends ParamsMatcher(Iterable.empty)

  class ParamsIncludes(items: Parameters) extends ParamsMatcher(items, false)

}
