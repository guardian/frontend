package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.matchers.ShouldMatchers
import collection.JavaConversions._
import org.scalatest.FlatSpec
import org.openqa.selenium.htmlunit.HtmlUnitDriver

class TagControllerTest extends FlatSpec with ShouldMatchers {

  /*
     Integration Tests need to be monolithic at the moment, if we try to fire up more than one server everything freezes

     see bug: https://play.lighthouseapp.com/projects/82401-play-20/tickets/129
  */

  "Tag Controller" should "fetch and render a tag" in running(TestServer(3333), HTMLUNIT) { browser =>

    import browser._

    //was blowing up on jQuery javascript
    //this seems to be a common problem http://stackoverflow.com/questions/7628243/intrincate-sites-using-htmlunit
    browser.webDriver.asInstanceOf[HtmlUnitDriver].setJavascriptEnabled(false)

    goTo("http://localhost:3333/pages/world/turkey")

    $("h1").first.getText should be("Turkey")

    $("meta[name=page-id]").getAttributes("value").head should be("world/turkey")
    $("meta[name=section]").getAttributes("value").head should be("world")
    $("meta[name=api-url]").getAttributes("value").head should be("http://content.guardianapis.com/world/turkey")
    $("meta[name=web-title]").getAttributes("value").head should be("Turkey")
  }

}