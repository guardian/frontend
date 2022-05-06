package test

import org.scalatest.{BeforeAndAfterAll, DoNotDiscover}
import org.scalatest.matchers.should.Matchers
import play.api.test.Helpers._
import controllers.CommentCountController
import org.scalatest.flatspec.AnyFlatSpec

@DoNotDiscover class CommentCountControllerTest
    extends AnyFlatSpec
    with Matchers
    with ConfiguredTestSuite
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestWsClient {

  "Discussion" should "return 200" in {
    val result =
      new CommentCountController(new DiscussionApiStub(wsClient), play.api.test.Helpers.stubControllerComponents())
        .commentCount("p/37v3a")(TestRequest())
    status(result) should be(200)
  }
}
