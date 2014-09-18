package client.connection.dispatch

import org.scalatest.{DoNotDiscover, FreeSpec, Matchers}
import org.scalatest.mock.MockitoSugar
import common.ExecutionContexts
import client.connection.HttpResponse
import test.ConfiguredTestSuite

@DoNotDiscover class DispatchAsyncHttpClientTest extends FreeSpec with Matchers with MockitoSugar with ConfiguredTestSuite {
  val client = mock[dispatch.Http]
  object TestDispatchAsyncHttpClient extends DispatchAsyncHttpClient with ExecutionContexts

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
