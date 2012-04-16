package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.matchers.ShouldMatchers
import collection.JavaConversions._
import org.scalatest.FlatSpec
import org.openqa.selenium.htmlunit.HtmlUnitDriver

class ArticleControllerTest extends FlatSpec with ShouldMatchers {

  /*
     Integration Tests need to be monolithic at the moment, if we try to fire up more than one server everything freezes

     see bug: https://play.lighthouseapp.com/projects/82401-play-20/tickets/129
  */

  "Article Controller" should "fetch and render an article" in running(TestServer(3333), HTMLUNIT) { browser =>

    import browser._

    //was blowing up on jQuery javascript
    //this seems to be a common problem http://stackoverflow.com/questions/7628243/intrincate-sites-using-htmlunit
    browser.webDriver.asInstanceOf[HtmlUnitDriver].setJavascriptEnabled(false)

    goTo("http://localhost:3333/pages/environment/2012/feb/22/capitalise-low-carbon-future")

    $("h1").first.getText should be("We must capitalise on a low-carbon future")

    $("p").first.getText should include("David Cameron this week strongly defended onshore wind power")

    val linkNames = $("li").getTexts
    val linkUrls = $("a").getAttributes("href")

    //trail in related content
    //TODO a test against related content is going to be fragile - find another way
    linkNames should contain ("The real green new deal | Tony Blair and Nicholas Stern")
    linkUrls should contain ("http://localhost:3333/commentisfree/cif-green/2009/sep/22/tony-blair-nicholas-stern-climate")

    //tag in navigation
    linkNames should contain ("Environment")
    linkUrls should contain ("http://localhost:3333/environment/climate-change")

    $("meta[name=content-type]").getAttributes("value").head should be ("Article")
    $("meta[name=api-url]").getAttributes("value").head should be ("http://content.guardianapis.com/environment/2012/feb/22/capitalise-low-carbon-future")
  }

  it should "404 when content type is not article" in {
    val result = controllers.ArticleController.render("world/video/2012/feb/10/inside-tibet-heart-protest-video")(FakeRequest())
    status(result) should be(404)
  }


}