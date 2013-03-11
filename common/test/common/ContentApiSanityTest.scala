package common

import org.scalatest.FlatSpec
import java.net.{ HttpURLConnection, URL }
import org.scalatest.matchers.ShouldMatchers

class ContentApiSanityTest extends FlatSpec with ShouldMatchers {

  /*
  *
  * We expect content api to do a few things for us and want to know really quickly if they stop doing them
  *
  * */

  val MaxAge = """max-age=(\d){2}""".r //max cache control before we get worried will be 99 seconds

  "ContentApi" should "have a sensible response" in {

    val connection = new URL("http://content.guardianapis.com/index?format=json&show-editors-picks=true&order-by=newest&api-key=v5aqu6tbws8btjr67bbfsv89")
      .openConnection().asInstanceOf[HttpURLConnection]

    connection.setRequestProperty("Accept-Encoding", "gzip")

    connection.getResponseCode should be(200)

    //TODO enable once gzipping of content api is rolled out
    //connection.getHeaderField("Content-Encoding") should include("gzip")

    connection.getHeaderField("cache-control") match {
      case MaxAge(num) => Unit //do nothing this is cached for less than 100 seconds
      case _ => fail(s"did not like cache control header: ${connection.getHeaderField("cache-control")}")
    }

    connection.getHeaderField("Vary") should include("Accept-Encoding")
  }
}
