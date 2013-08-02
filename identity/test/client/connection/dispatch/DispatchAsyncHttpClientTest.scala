package client.connection.dispatch

import org.scalatest.path
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.mock.MockitoSugar
import org.mockito.Mockito._
import common.ExecutionContexts
import client.connection.HttpResponse
import dispatch.Req


class DispatchAsyncHttpClientTest extends path.FreeSpec with ShouldMatchers with MockitoSugar {
  val client = mock[dispatch.Http]
  object TestDispatchAsyncHttpClient extends DispatchAsyncHttpClient with ExecutionContexts

  "the buildRequest method" - {
    val req = mock[Req]

    "adds the URL parameters to the request" in {
      val params = List(("key1", "value1"), ("key2", "value2"))
      TestDispatchAsyncHttpClient.buildRequest(req, params, Iterable.empty)
      params.foreach(param => verify(req).addQueryParameter(param._1, param._2))
    }

    "adds the headers to the request" in {
      val headers = List(("key1", "value1"), ("key2", "value2"))
      TestDispatchAsyncHttpClient.buildRequest(req, Iterable.empty, headers)
      headers.foreach(param => verify(req).addHeader(param._1, param._2))
    }
  }

  "mapFutureToResponse" - {
    "converts a Left[Throwable] to a Left[List[Error]] that contains the exception message" in {
      TestDispatchAsyncHttpClient.mapFutureToResponse(Left(new Exception("Test message"))) match {
        case Right(result) => fail("Got Right(%s), instead of expected Left".format(result.toString))
        case Left(errors) => {
          errors.size should equal(1)
          errors(0) should have('message("java.lang.Exception"))
          errors(0) should have('description("Test message"))
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
