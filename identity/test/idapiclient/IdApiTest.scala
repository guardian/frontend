package idapiclient

import org.scalatest.path
import org.scalatest.mock.MockitoSugar
import org.scalatest.matchers.ShouldMatchers
import org.mockito.Mockito._
import org.mockito.Matchers.argThat
import org.mockito.Matchers
import client.connection.{HttpResponse, Http}
import client.parser.JsonBodyParser
import scala.concurrent.{Promise, ExecutionContext}
import client.{Error, Anonymous, Auth, Parameters, Response}
import org.hamcrest.Description
import org.mockito.ArgumentMatcher
import org.joda.time.DateTime
import client.connection.util.ExecutionContexts


class IdApiTest extends path.FreeSpec with ShouldMatchers with MockitoSugar {
  implicit def executionContext: ExecutionContext = ExecutionContexts.currentThreadContext

  val apiRoot = "http://example.com/"
  val http = mock[Http]
  val jsonParser = mock[JsonBodyParser]
  val api = new SynchronousIdApi(apiRoot, http, jsonParser)
  val errors = List(Error("Test error", "Error description", 500))
  val trackingParameters = mock[OmnitureTracking]
  when(trackingParameters.parameters).thenReturn(List("tracking" -> "param"))

  "the authApp method" - {
    val validAccessTokenResponse = HttpResponse("""{"accessToken": "abc", "expiresAt": "2013-10-30T12:21:00+00:00"}""", 200, "OK")

    "given a valid response" - {
      when(http.GET(Matchers.any[String], Matchers.any[Parameters], Matchers.any[Parameters]))
        .thenReturn(toFuture(Right(validAccessTokenResponse)))

      "accesses the /auth endpoint" in {
        api.authApp(Anonymous, trackingParameters)
        verify(http).GET(Matchers.eq("http://example.com/auth"), Matchers.any[Parameters], Matchers.any[Parameters])
      }

      "passes the auth parameters to the http lib's GET method" in {
        api.authApp(ParamAuth, trackingParameters)
        verify(http).GET(Matchers.any[String], argThat(new ParamMatcher(Iterable(("testParam", "value"), ("tracking", "param")))), argThat(EmptyParamMatcher))
      }

      "passes the auth header to the http lib's GET method" in {
        api.authApp(HeaderAuth, trackingParameters)
        verify(http).GET(Matchers.any[String], argThat(EmptyParamMatcher), argThat(new ParamMatcher(Iterable(("testHeader", "value")))))
      }

      "returns an access token response" in {
        api.authApp(Anonymous, trackingParameters).map(_ match {
          case Left(result) => fail("Got Left(%s), instead of expected Right".format(result.toString()))
          case Right(accessTokenResponse) => {
            accessTokenResponse should have('accessToken("abc"))
            accessTokenResponse should have('expiresAt(new DateTime(2013, 10, 30, 12, 21)))
          }
        })
      }
    }

    "given a failure response" - {
      when(http.GET(Matchers.any[String], Matchers.any[Parameters], Matchers.any[Parameters]))
        .thenReturn(toFuture(Left(errors)))

      "returns the errors" in {
        api.authApp(Anonymous, trackingParameters).map(_ match {
          case Right(result) => fail("Got Right(%s), instead of expected Left".format(result.toString))
          case Left(responseErrors) => {
            responseErrors should equal(errors)
          }
        })
      }
    }
  }

  "the authBrowser method" - {
    "given a valid response" - {
      val validCookieResponse = HttpResponse("""{"expiry": "2013-10-30T12:21:00+00:00", "values": [{"name": testName", "value": "testValue"}]}""", 200, "OK")
      when(http.POST(Matchers.any[String], Matchers.any[Option[String]], Matchers.any[Parameters], Matchers.any[Parameters]))
        .thenReturn(toFuture(Right(validCookieResponse)))

      "accesses the /auth endpoint" in {
        api.authBrowser(Anonymous, trackingParameters)
        verify(http).POST(Matchers.eq("http://example.com/auth"), Matchers.any[Option[String]], Matchers.any[Parameters], Matchers.any[Parameters])
      }

      "adds the cookie parameter to the request" in {
        api.authBrowser(Anonymous, trackingParameters)
        verify(http).POST(Matchers.eq("http://example.com/auth"), Matchers.any[Option[String]], argThat(new ParamMatcher(Iterable(("format", "cookie")))), Matchers.any[Parameters])
      }

      "passes the auth parameters to the http lib's GET method" in {
        val auth = TestAuth(List(("testParam", "value")), Iterable.empty)
        api.authBrowser(auth, trackingParameters)
        verify(http).POST(Matchers.any[String], Matchers.any[Option[String]], argThat(new ParamMatcher(Iterable(("testParam", "value"), ("format", "cookie")))), argThat(EmptyParamMatcher))
      }

      "passes the auth header to the http lib's GET method" in {
        val auth = TestAuth(Iterable.empty, List(("testHeader", "value")))
        api.authBrowser(auth, trackingParameters)
        verify(http).POST(Matchers.any[String], Matchers.any[Option[String]], argThat(new ParamMatcher(Iterable(("format", "cookie")))), argThat(new ParamMatcher(Iterable(("testHeader", "value")))))
      }

      "returns a cookies response" in {
        api.authBrowser(Anonymous, trackingParameters).map(_ match {
          case Left(result) => fail("Got Left(%s), instead of expected Right".format(result.toString()))
          case Right(cookiesResponse) => {
            cookiesResponse.size should equal(1)
            cookiesResponse(0) should have('name("testName"))
            cookiesResponse(0) should have('value("testValue"))
          }
        })
      }
    }

    "given an error" - {
      when(http.POST(Matchers.any[String], Matchers.any[Option[String]], Matchers.any[Parameters], Matchers.any[Parameters]))
        .thenReturn(toFuture(Left(errors)))

      "returns the errors" in {
        api.authBrowser(Anonymous, trackingParameters).map(_ match {
          case Right(result) => fail("Got Right(%s), instead of expected Left".format(result.toString()))
          case Left(responseErrors) => {
            responseErrors should equal(errors)
          }
        })
      }
    }
  }

  "the user method" - {
    "when receiving a valid response" - {
      val userJSON = """{"id": "123", "primaryEmailAddress": "test@example.coma", "publicFields": {"displayName": "displayName", "username": "Username", "usernameLowerCase": "username", "vanityUrl": "vanityUrl"}}"""
      val validUserResponse = HttpResponse(userJSON, 200, "OK")
      when(http.GET(Matchers.any[String], Matchers.any[Parameters], Matchers.any[Parameters]))
        .thenReturn(toFuture(Right(validUserResponse)))

      "accesses the user endpoint with the user's id" in {
        api.user("123")
        verify(http).GET("http://example.com/user/123", Iterable.empty, Iterable.empty)
      }

      "returns the user object" in {
        api.user("123").map(_ match {
          case Left(result) => fail("Got Left(%s), instead of expected Right".format(result.toString()))
          case Right(user) => {
            user should have('id("123"))
            user.publicFields should have('displayName("displayName"))
            user.publicFields should have('username("Username"))
            user.publicFields should have('usernameLowerCase("username"))
            user.publicFields should have('vanityUrl("vanityUrl"))
            user.primaryEmailAddress should have('priomaryEmailAddress("test@example.com"))
          }
        })
      }

      "when providinug authentication to the request" - {
        "adds the url parameters" in {
          api.user("123", ParamAuth)
          verify(http).GET(Matchers.any[String], argThat(new ParamMatcher(Iterable(("testParam", "value")))), argThat(EmptyParamMatcher))
        }

        "adds the request headers" in {
          api.user("123", HeaderAuth)
          verify(http).GET(Matchers.any[String], argThat(EmptyParamMatcher), argThat(new ParamMatcher(Iterable(("testHeader", "value")))))
        }
      }
    }

    "when receiving an error response" - {
      when(http.GET(Matchers.any[String], Matchers.any[Parameters], Matchers.any[Parameters]))
        .thenReturn(toFuture(Left(errors)))

      "returns the errors" in {
        api.user("123").map(_ match {
          case Right(result) => fail("Got Right(%s), instead of expected Left".format(result.toString))
          case Left(responseErrors) => {
            responseErrors should equal(errors)
          }
        })
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
        verify(http).GET("http://example.com/user/me", Iterable.empty, Iterable.empty)
      }

      "returns the user object" in {
        api.me(Anonymous).map(_ match {
          case Left(result) => fail("Got Left(%s), instead of expected Right".format(result.toString()))
          case Right(user) => {
            user should have('id("1234"))
            user.publicFields should have('displayName("displayName"))
            user.publicFields should have('username("Username"))
            user.publicFields should have('usernameLowerCase("username"))
            user.publicFields should have('vanityUrl("vanityUrl"))
            user.primaryEmailAddress should have('priomaryEmailAddress("test@example.com"))
          }
        })
      }

      "adds the auth url parameters" in {
        api.me(ParamAuth)
        verify(http).GET(Matchers.any[String], argThat(new ParamMatcher(Iterable(("testParam", "value")))), argThat(EmptyParamMatcher))
      }

      "adds the auth request headers" in {
        api.me(HeaderAuth)
        verify(http).GET(Matchers.any[String], argThat(EmptyParamMatcher), argThat(new ParamMatcher(Iterable(("testHeader", "value")))))
      }
    }

    "when receiving an error response" - {
      when(http.GET(Matchers.any[String], Matchers.any[Parameters], Matchers.any[Parameters]))
        .thenReturn(toFuture(Left(errors)))

      "returns the errors" in {
        api.me(Anonymous).map(_ match {
          case Right(result) => fail("Got Right(%s), instead of expected Left".format(result.toString))
          case Left(responseErrors) => {
            responseErrors should equal(errors)
          }
        })
      }
    }
  }

  "synchronous version" - {
    val syncApi = new SynchronousIdApi(apiRoot, http, jsonParser)

    "should use current thread context" in {
      syncApi.executionContext should equal(ExecutionContexts.currentThreadContext)
    }
  }

  def toFuture(response: Response[HttpResponse]) = Promise.successful(response).future

  case class TestAuth(parameters: Parameters, headers: Parameters) extends Auth
  object ParamAuth extends TestAuth(Iterable(("testParam", "value")), Iterable.empty)
  object HeaderAuth extends TestAuth(Iterable.empty, Iterable(("testHeader", "value")))

  class ListMatcher[T](items: Iterable[T]) extends ArgumentMatcher {
    override def matches(arg: Any): Boolean = {
      arg match {
        case list: Iterable[T] if list.size == items.size => items.forall(t => list.exists(_ == t))
        case _ => false
      }
    }
    override def describeTo(description: Description): Unit = {
      description.appendText("Iterable" + items.mkString("(", ",", ")"))
    }
  }
  class ParamMatcher(items: Parameters) extends ListMatcher[(String, String)](items)
  object EmptyParamMatcher extends ParamMatcher(Iterable.empty)
}
