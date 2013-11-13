package discussion

import org.scalatest.FreeSpec
import play.api.libs.ws.Response
import scala.concurrent._
import scala.concurrent.duration._
import scala.language.postfixOps

class DiscussionApiTest extends FreeSpec {


  "Should do GET request on correct URL for topComments " in {
    val expectedUrl: String = "/discussion/aKey/highlights?pageSize=50&page=1&orderBy=newest&showSwitches=true"

    val discussionApi = new DiscussionApi {
      protected def GET(url: String, headers: (String, String)*): Future[Response] = {
        assert(expectedUrl === url)
        future {null} // Don't care what is returned for this test
      }
      protected val clientHeaderValue: String = ""
      protected val apiRoot: String = ""
    }

    Await.ready(discussionApi.topCommentsFor("aKey", "1"), 2 seconds)
  }

  "Should do GET request on correct URL for comments " in {
    val expectedUrl: String = "/discussion/aKey?pageSize=50&page=1&orderBy=newest&showSwitches=true"

    val discussionApi = new DiscussionApi {
      protected def GET(url: String, headers: (String, String)*): Future[Response] = {
        assert(expectedUrl === url)
        future {null}
      }
      protected val clientHeaderValue: String = ""
      protected val apiRoot: String = ""
    }

    Await.ready(discussionApi.commentsFor("aKey", "1"), 2 seconds)
  }


}
