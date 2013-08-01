package idapiclient

import org.scalatest.path
import org.scalatest.mock.MockitoSugar
import org.scalatest.matchers.ShouldMatchers
import org.mockito.Mockito._
import org.mockito.Matchers.argThat
import org.mockito.Matchers
import client.connection.{HttpResponse, AsyncronousHttp, SyncronousHttp, Http}
import client.parser.JsonBodyParser
import client.util.Id
import scala.concurrent.{Promise, ExecutionContext, Future}
import client.{Error, Anonymous, Auth, Parameters}
import org.hamcrest.{Description, BaseMatcher, Matcher}
import org.mockito.ArgumentMatcher
import org.joda.time.DateTime


class IdApiTest extends path.FreeSpec with ShouldMatchers with MockitoSugar  {
  val apiRoot = "http://example.com/"
  val jsonParser = mock[JsonBodyParser]

  "sync version" - {
    val syncHttp = mock[SyncronousHttp]
    val syncApi = new SyncIdApi(apiRoot, syncHttp, jsonParser)

    "the authApp method" - {
      "accesses the /auth endpoint" in {
        syncApi.authApp(Anonymous)
        verify(syncHttp).GET(Matchers.eq("http://example.com/auth"), Matchers.any[Parameters], Matchers.any[Parameters])
      }

      "passes the auth parameters to the http lib's GET method" in {
        val auth = TestAuth(List(("testParam", "value")), Iterable.empty)
        syncApi.authApp(auth)
        verify(syncHttp).GET(Matchers.any[String], argThat(new ParamMatcher(Iterable(("testParam", "value")))), argThat(EmptyParamMatcher))
      }

      "passes the auth header to the http lib's GET method" in {
        val auth = TestAuth(Iterable.empty, List(("testHeader", "value")))
        syncApi.authApp(auth)
        verify(syncHttp).GET(Matchers.any[String], argThat(EmptyParamMatcher), argThat(new ParamMatcher(Iterable(("testHeader", "value")))))
      }

//      "returns an access token response if successful" in {
//        when(syncHttp.GET(Matchers.any[String], Matchers.any[Parameters], Matchers.any[Parameters]))
//          .thenReturn(Right(HttpResponse("""{"accessToken": "abc", "expiresAt": "2013-10-30T12:21:00+00:00"}""", 200, "OK")))
//        val tmp = syncApi.authApp(Anonymous).map { _ match {
//            case Left(result) => fail("Got Left(%s), instead of expected Right".format(result.toString()))
//            case Right(accessTokenResponse) => {
//              accessTokenResponse should have('accessToken("abc"))
//              accessTokenResponse should have('expiresAt(new DateTime(2013, 10, 30, 12, 21)))
//            }
//          }
//        }
//      }
//      Promise
//
//      "returns errors if there was a failure" in {
//        val errors = List(Error("Test error", "Error description", 500))
//        when(syncHttp.GET(Matchers.any[String], Matchers.any[Parameters], Matchers.any[Parameters]))
//          .thenReturn(Left(errors))
//        syncApi.authApp(Anonymous) match {
//          case Right(result) => fail("Got Right(%s), instead of expected Left".format(result.toString()))
//          case Left(responseErrors) => {
//            responseErrors should equal(errors)
//          }
//        }
//      }
    }
  }

  "async version" - {
    val syncHttp = mock[AsyncronousHttp]
    val asyncApi = new AsyncIdApi(apiRoot, syncHttp, jsonParser) {
      override def executionContext = new ExecutionContext {
        def execute(runnable: Runnable) {
          runnable.run()
        }
        def reportFailure(t: Throwable) {
          ExecutionContext.defaultReporter(t)
        }
      }
    }


  }

  case class TestAuth(parameters: Parameters, headers: Parameters) extends Auth

  class ListMatcher[T](items: Iterable[T]) extends ArgumentMatcher {
    override def matches(arg: Any): Boolean = {
      arg match {
        case list: Iterable[T] if list.size == items.size => items.forall(t => list.exists(_ == t))
        case _ => false
      }
    }
    override def describeTo(description: Description): Unit = {
      description.appendText("Iterable" + items.mkString(","))
    }
  }
  class ParamMatcher(items: Parameters) extends ListMatcher[(String, String)](items)
  object EmptyParamMatcher extends ParamMatcher(Iterable.empty)

}
