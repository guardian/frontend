package client.connection.javanet

import org.scalatest.path
import org.scalatest.Matchers
import org.scalatest.mock.MockitoSugar
import java.net.{MalformedURLException, HttpURLConnection}
import org.mockito.Mockito._


class JavaNetSyncHttpClientTest extends path.FreeSpec with Matchers with MockitoSugar {

  val urlConnection = mock[HttpURLConnection]

  "the internal getConnection method" - {
    "when given a valid URL," - {
      object TestJavaNetSyncHttpClient extends JavaNetSyncHttpClient {
        override protected def getURL(url: String) = urlConnection
      }

      "returns the connection" - {
        TestJavaNetSyncHttpClient.getConnection("http://www.example.com/", Iterable.empty, Iterable.empty, "GET") match {
          case Left(result) => fail("Got Left(%s), instead of expected Right".format(result.toString()))
          case Right(connection) => connection should be(urlConnection)
        }
      }

      "should add the querystring" in {
        object QuerystringTestJavaNetSyncHttpClient extends JavaNetSyncHttpClient {
          override protected def getURL(url: String) = {
            url should equal("http://www.example.com/?key1=value1&key2=value2")
            urlConnection
          }
        }
        val params = List(("key1", "value1"), ("key2", "value2"))
        QuerystringTestJavaNetSyncHttpClient.getConnection("http://www.example.com/", params, Iterable.empty, "GET")
      }

      "should add the provided headers" in {
        val headers = List(("key1", "value1"), ("key2", "value2"))
        TestJavaNetSyncHttpClient.getConnection("http://www.example.com/", Iterable.empty, headers, "GET")
        headers.foreach(header => {
          verify(urlConnection).setRequestProperty(header._1, header._2)
        })
      }

      "can set the GET method" in {
        TestJavaNetSyncHttpClient.getConnection("http://www.example.com/", Iterable.empty, Iterable.empty, "GET")
        verify(urlConnection).setRequestMethod("GET")
      }
      "can set the POST method" in {
        TestJavaNetSyncHttpClient.getConnection("http://www.example.com/", Iterable.empty, Iterable.empty, "POST")
        verify(urlConnection).setRequestMethod("POST")
      }
      "can set the DELETE method" in {
        TestJavaNetSyncHttpClient.getConnection("http://www.example.com/", Iterable.empty, Iterable.empty, "DELETE")
        verify(urlConnection).setRequestMethod("DELETE")
      }
    }

    "when given a malformed URL," - {
      object TestJavaNetSyncHttpClient extends JavaNetSyncHttpClient {
        override protected def getURL(url: String) = throw new MalformedURLException("Test MalformedURLException")
      }

      "should return a MalformedURLException error" in {
        TestJavaNetSyncHttpClient.getConnection("http bad url", Iterable.empty, Iterable.empty, "GET") match {
          case Right(result) => fail("Got Right(%s), instead of expected Left".format(result.toString))
          case Left(connection) => connection(0) should have('message("MalformedURLException"))
        }
      }
    }
  }


  "the GET method" - {

  }
  "the POST method" - {

  }
  "the DELETE method" - {

  }
}
