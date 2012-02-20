package test

import play.api.libs.ws.WS
import play.api.test._
import play.api.test.Helpers._
import org.scalatest.FlatSpec
import org.scalatest.matchers.ShouldMatchers

class ApplicationTest extends FlatSpec with ShouldMatchers {

  "Application" should "serve a 200 on the root endpoint" in {
    running(TestServer(3333)) {
      val root = await(WS.url("http://localhost:3333/").get)
      root.status should be(200)
    }
  }

}