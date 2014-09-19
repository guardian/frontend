package client.connection.apache

import org.scalatest.path
import org.scalatest.mock.MockitoSugar
import org.scalatest.Matchers
import org.apache.commons.httpclient.{NameValuePair, HttpException, HttpMethod, HttpClient}
import org.mockito.Mockito._
import java.io.IOException
import client.connection.HttpResponse
import client.Parameters
import scala.concurrent.ExecutionContext
import client.connection.util.ExecutionContexts


class ApacheSyncHttpClientTest extends path.FreeSpec with Matchers with MockitoSugar {
  implicit def executionContext: ExecutionContext = ExecutionContexts.currentThreadContext
  val mockHttpClient = mock[HttpClient]


  "the internal execute method," - {
    object TestApacheSyncHttpClient extends ApacheSyncHttpClient {
      override val httpClient = mockHttpClient
    }
    val method = mock[HttpMethod]

    "if the call succeeds," - {
      when(method.getStatusCode) thenReturn 200
      when(method.getStatusText) thenReturn "OK"
      when(method.getResponseBodyAsString) thenReturn "Response body"

      "adds the provided url parameters" in {
        val params = List(("key1", "value1"), ("key2", "value2"))
        TestApacheSyncHttpClient.execute(method, params, Iterable.empty)
        verify(method).setQueryString(params.toArray.map { case (k, v) => new NameValuePair(k, v) })
      }

      "adds the provided request headers" in {
        val headers = List(("key1", "value1"), ("key2", "value2"))
        TestApacheSyncHttpClient.execute(method, Iterable.empty, headers)
        headers.foreach(header => {
          verify(method).addRequestHeader(header._1, header._2)
        })
      }

      "extracts the method' status code" in {
        TestApacheSyncHttpClient.execute(method, Iterable.empty, Iterable.empty)
        verify(method).getStatusCode
      }

      "extracts the response body' status code" in {
        TestApacheSyncHttpClient.execute(method, Iterable.empty, Iterable.empty)
        verify(method).getResponseBodyAsString
      }

      "returns the response" in {
        TestApacheSyncHttpClient.execute(method, Iterable.empty, Iterable.empty) match {
          case Left(result) => fail("Got Left(%s), instead of expected Right".format(result.toString()))
          case Right(httpResponse) => httpResponse should equal(HttpResponse("Response body", 200, "OK"))
        }
      }

      "executes the method" in {
        TestApacheSyncHttpClient.execute(method, Iterable.empty, Iterable.empty)
        verify(mockHttpClient).executeMethod(method)
      }

      "releases the connection" in {
        TestApacheSyncHttpClient.execute(method, Iterable.empty, Iterable.empty)
        verify(method).releaseConnection()
      }
    }

    "if the call raises an HttpException," - {
      when(mockHttpClient.executeMethod(method)).thenThrow(new HttpException("Test exception"))

      "returns the error" in {
        TestApacheSyncHttpClient.execute(method, Iterable.empty, Iterable.empty) match {
          case Right(result) => fail("Got Right(%s), instead of expected left".format(result.toString))
          case Left(errors) => errors(0).message should startWith("HttpException")
        }
      }

      "releases the connection" in {
        TestApacheSyncHttpClient.execute(method, Iterable.empty, Iterable.empty)
        verify(method).releaseConnection()
      }
    }

    "if the call raises an IOException, " - {
      when(mockHttpClient.executeMethod(method)).thenThrow(new IOException("Test exception"))

      "returns the error" in {
        TestApacheSyncHttpClient.execute(method, Iterable.empty, Iterable.empty) match {
          case Right(result) => fail("Got Right(%s), instead of expected Left".format(result.toString))
          case Left(errors) => errors(0).message should startWith("IOException")
        }
      }

      "releases the connection" in {
        TestApacheSyncHttpClient.execute(method, Iterable.empty, Iterable.empty)
        verify(method).releaseConnection()
      }
    }
  }

  "the GET method" - {
    val httpResponse = HttpResponse("Response body", 200, "OK")
    object TestApacheSyncHttpClient extends ApacheSyncHttpClient {
      override val httpClient = mockHttpClient
      override def execute(method: HttpMethod, urlParameters: Parameters, headers: Parameters) = {
        Right(httpResponse)
      }
    }

    "given valid parameters, should return execute's result" in {
      TestApacheSyncHttpClient.GET("http://valid.url").map(_ match {
        case Left(result) => fail("Got Left(%s), instead of expected Right".format(result.toString()))
        case Right(response) => response should be(httpResponse)
      })
    }

    "given an invalid URI, should return IllegalArgumentException error" in {
      TestApacheSyncHttpClient.GET("http:// not a valid URI").map(_ match {
        case Right(result) => fail("Got Right(%s), instead of expected Left".format(result.toString))
        case Left(errors) => errors(0) should have('message("IllegalArgumentException"))
      })
    }

    "given an invalid protocol in the URI, should return IllegalStateException error" in {
      TestApacheSyncHttpClient.GET("bad://example.com/test").map(_ match {
        case Right(result) => fail("Got Right(%s), instead of expected Left".format(result.toString))
        case Left(errors) => errors(0) should have('message("IllegalStateException"))
      })
    }
  }

  "the POST method" - {
    val httpResponse = HttpResponse("Response body", 200, "OK")
    object TestApacheSyncHttpClient extends ApacheSyncHttpClient {
      override val httpClient = mockHttpClient
      override def execute(method: HttpMethod, urlParameters: Parameters, headers: Parameters) = {
        Right(httpResponse)
      }
    }

    "given valid parameters, should return execute's result" in {
      TestApacheSyncHttpClient.POST("http://valid.url", Some("body")).map(_ match {
        case Left(result) => fail("Got Left(%s), instead of expected Right".format(result.toString()))
        case Right(response) => response should be(httpResponse)
      })
    }

    "given an invalid URI, should return IllegalArgumentException error" in {
      TestApacheSyncHttpClient.POST("http:// not a valid URI", Some("body")).map(_ match {
        case Right(result) => fail("Got Right(%s), instead of expected Left".format(result.toString))
        case Left(errors) => errors(0) should have('message("IllegalArgumentException"))
      })
    }

    "given an invalid protocol in the URI, should return IllegalStateException error" in {
      TestApacheSyncHttpClient.POST("bad://example.com/test", Some("body")).map(_ match {
        case Right(result) => fail("Got Right(%s), instead of expected Left".format(result.toString))
        case Left(errors) => errors(0) should have('message("IllegalStateException"))
      })
    }
  }

  "the DELETE method" - {
    val httpResponse = HttpResponse("Response body", 200, "OK")
    object TestApacheSyncHttpClient extends ApacheSyncHttpClient {
      override val httpClient = mockHttpClient
      override def execute(method: HttpMethod, urlParameters: Parameters, headers: Parameters) = {
        Right(httpResponse)
      }
    }

    "given valid parameters, should return execute's result" in {
      TestApacheSyncHttpClient.DELETE("http://valid.url").map(_  match {
        case Left(result) => fail("Got Left(%s), instead of expected Right".format(result.toString))
        case Right(response) => response should be(httpResponse)
      })
    }

    "given an invalid URI, should return IllegalArgumentException error" in {
      TestApacheSyncHttpClient.DELETE("http:// not a valid URI").map(_ match {
        case Right(result) => fail("Got Right(%s), instead of expected Left".format(result.toString))
        case Left(errors) => errors(0) should have('message("IllegalArgumentException"))
      })
    }

    "given an invalid protocol in the URI, should return IllegalStateException error" in {
      TestApacheSyncHttpClient.DELETE("bad://example.com/test").map(_ match {
        case Right(result) => fail("Got Right(%s), instead of expected Left".format(result.toString))
        case Left(errors) => errors(0) should have('message("IllegalStateException"))
      })
    }
  }
}
