package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.matchers.ShouldMatchers
import collection.JavaConversions._
import org.scalatest.FlatSpec

class ArticleControllerTest extends FlatSpec with ShouldMatchers {

  /*
     Integration Tests need to be monolithic at the moment, if we try to fire up more than one server everything freezes

     see bug: https://play.lighthouseapp.com/projects/82401-play-20/tickets/129
  */

  "Article Controller" should "fetch and render an article" in running(TestServer(3333), HTMLUNIT) { browser =>

    import browser._

    goTo("http://localhost:3333/environment/2012/feb/22/capitalise-low-carbon-future")

    $("h1").first.getText should be("We must capitalise on a low-carbon future")

    $("#body").first.getText should include("Last year I launched a white paper on local transport")

    val tagNames = $(".nav a").getTexts
    tagNames.length should be > (3)
    tagNames should contain("Environment")

  }

  it should "404 when content type is not article" in {
    val result = controllers.ArticleController.render("world/video/2012/feb/10/inside-tibet-heart-protest-video")(FakeRequest())
    status(result) should be(404)
  }
}