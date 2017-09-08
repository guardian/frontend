package client.connection.dispatch

import org.scalatest.path
import org.scalatest.Matchers
import org.scalatest.mockito.MockitoSugar
import org.mockito.Mockito._
import client.connection.HttpResponse
import dispatch.Req
import test.WithTestExecutionContext

import scala.concurrent.ExecutionContext


class DispatchAsyncHttpClientTest extends path.FreeSpec with Matchers with MockitoSugar with WithTestExecutionContext {
  val client = mock[dispatch.Http]

  object TestDispatchAsyncHttpClient extends DispatchAsyncHttpClient {
    override implicit def executionContext: ExecutionContext = testExecutionContext
  }

  "the buildRequest method" - {

  }

  "mapFutureToResponse" - {
    "converts a Left[Throwable] to a Left[List[Error]] that contains the exception message" in {
      TestDispatchAsyncHttpClient.mapFutureToResponse(Left(new Exception("Test message"))) match {
        case Right(result) => fail("Got Right(%s), instead of expected Left".format(result.toString))
        case Left(errors) => {
          errors.size should equal(1)
          errors(0) should have('message("java.lang.Exception"))
          errors(0) should have('description("java.lang.Exception: Test message"))
        }
      }
    }

    "passes a right straight through" in {
      val response = HttpResponse("Test body", 200, "OK")
      TestDispatchAsyncHttpClient.mapFutureToResponse(Right(response)) match {
        case Left(result) => fail("Got Left(%s), instead of expected Right".format(result.toString()))
        case Right(mappedResponse) => mappedResponse should be(response)
      }
    }
  }
}
