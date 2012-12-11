package test

import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec
import play.api.test._
import play.api.test.Helpers._
import controllers.TagController
import play.api.mvc.AsyncResult

class TagControllerTest extends FlatSpec with ShouldMatchers {

  "Tag Controller" should "200 when content type is tag" in Fake {
    val result = TagController.render("world/turkey")(FakeRequest())
    status(await(result.asInstanceOf[AsyncResult].result)) should be(200)
  }

  it should "404 when content type is not tag" in Fake {
    val result = TagController.render("world/video/2012/feb/10/inside-tibet-heart-protest-video")(FakeRequest())
    status(await(result.asInstanceOf[AsyncResult].result)) should be(404)
  }
}