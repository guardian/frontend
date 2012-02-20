package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.FlatSpec
import org.scalatest.matchers.ShouldMatchers

class IntegrationTest extends FlatSpec with ShouldMatchers {

  // TODO: This style integration test will be done using QA test automation library in separate project.

  // TODO: Waiting on a fix before enabling: https://play.lighthouseapp.com/projects/82401-play-20/tickets/129
  //  "Root endpoint" should "have h1 title" in {
  //    running(TestServer(3333), HTMLUNIT) { browser =>
  //      import browser._
  //
  //      goTo("http://localhost:3333/")
  //
  //      $("h1").first.getText should be("Your article goes here")
  //    }
  //  }

}