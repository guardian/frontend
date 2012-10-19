package test

import org.scalatest.FeatureSpec
import org.scalatest.GivenWhenThen
import org.scalatest.matchers.ShouldMatchers
import controllers.front.{ TrailblockAgent, FrontEdition, Front }
import model._
import org.joda.time.DateTime
import collection.JavaConversions._
import controllers.{ FrontController }
import play.api.test.FakeRequest
import play.api.mvc._
import model.Trailblock
import scala.Some
import controllers.FrontPage
import model.TrailblockDescription

class FrontFeatureTest extends FeatureSpec with GivenWhenThen with ShouldMatchers with Results {

  feature("Network Front") {

    info("In order to explore the breaking news and navigate to site sections")
    info("As a Guardian reader")
    info("I want a single page that gives me a summary of the latest news")
    info("And has a summary and navigation to site sections")

    //Metrics
    info("Increase engagement (% of people continuing to a piece of content)")
    info("Page views should *not* decrease.")
    info("Increase repeat visits")

    //End to end integration tests

    scenario("Load the network front") {

      given("I visit the network front")
      HtmlUnit("/") {
        browser =>
          import browser._

          then("I should see the news trailblock")
          val news = $(".zone-news")
          news.findFirst("h1").getText should be("News")
          news.find(".trail-headline") should have length (9)
      }
    }

    scenario("Section navigation") {
      given("I visit the network front")
      HtmlUnit("/") {
        browser =>
          import browser._

          then("I should see the link for section navigation")
          findFirst("#sections-control-header").href should endWith("/#sections-footer")
      }
    }

    scenario("Link to desktop version") {
      given("I visit the network front")
      HtmlUnit("/") {
        browser =>
          import browser._

          then("I should see the link for the desktop site")
          findFirst("[data-link-name=UK]").href should endWith("http://www.guardian.co.uk/?mobile-redirect=false")
      }
    }

    scenario("Copyright") {
      given("I visit the network front")
      HtmlUnit("/") {
        browser =>
          import browser._

          then("I should see the copyright")
          findFirst(".footer p").getText should startWith("© Guardian News and Media Limited")

      }
    }

    scenario("Link tracking") {
      given("I visit the network front")
      HtmlUnit("/") {
        browser =>
          import browser._
          then("All links should be tracked")
          $("a").filter(!_.hasAttribute("data-link-name")).foreach { link =>
            fail("Link with text '%s' and url '%s' is not tracked".format(link.getText, link.getAttribute("href")))
          }
      }
    }

    //lower level tests

    scenario("Display top stories") {
      given("I visit the Network Front")

      Fake {
        //in real life these will always be editors picks only (content api does not do latest for front)
        val agent = TrailblockAgent(TrailblockDescription("", "Top Stories", 5), "UK")

        agent.refresh()
        agent.warmup()

        val trails = agent.trailblock.get.trails

        then("I should see the Top Stories")
        //we cannot really guarantee a length here
        //but it is unlikely to ever be < 10
        trails.length should be > 10
      }
    }

    scenario("load latest trails if there are no editors picks for a block") {
      given("I visit the Network Front")

      Fake {

        //in real life this tag will have no editors picks
        val agent = TrailblockAgent(TrailblockDescription("lifeandstyle/seasonal-food", "Seasonal food", 5), "UK")

        agent.refresh()
        agent.warmup()

        val trails = agent.trailblock.get.trails

        then("I should see the latest trails for a block that has no editors picks")
        trails should have length (20) //if only latest you just get 20 latest, hence exact length
      }
    }

    scenario("load editors picks and latest") {
      given("I visit the Network Front")

      Fake {

        //in real life this will always be a combination of editors picks + latest
        val agent = TrailblockAgent(TrailblockDescription("sport", "Sport", 5), "UK")

        agent.refresh()
        agent.warmup()

        val trails = agent.trailblock.get.trails

        then("I should see a combination of editors picks and latest")
        trails.length should be > 20 //if it is a combo you get editors picks + 20 latest, hence > 20
      }
    }

    scenario("load different content for UK and US front") {
      given("I visit the Network Front")

      Fake {

        //in real life these will always be editors picks only (content api does not do latest for front)
        val ukAgent = TrailblockAgent(TrailblockDescription("", "Top Stories", 5), "UK")
        val usAgent = TrailblockAgent(TrailblockDescription("", "Top Stories", 5), "US")

        ukAgent.refresh()
        usAgent.refresh()

        ukAgent.warmup()
        usAgent.warmup()

        val ukTrails = ukAgent.trailblock.get.trails
        val usTrails = usAgent.trailblock.get.trails

        then("I should see UK Top Stories if I am in the UK edition")
        and("I should see US Top Stories if I am in the US edition")

        ukTrails should not equal (usTrails)
      }
    }

    scenario("de-duplicate visible trails") {

      given("I am on the Network Front and I have not expanded any blocks")

      Fake {
        val duplicateStory = StubTrail("http://www.gu.com/1234")

        val description = TrailblockDescription("", "Name", 5)

        val topStoriesBlock = new TrailblockAgent(description, "UK") {
          override lazy val trailblock = Some(Trailblock(description, duplicateStory :: createTrails("world", 9)))
        }

        val sportStoriesBlock = new TrailblockAgent(description, "UK") {
          override lazy val trailblock = Some(Trailblock(description, duplicateStory :: createTrails("sport", 9)))
        }

        val front = new FrontEdition("UK", Nil) {
          override val manualAgents = Seq(topStoriesBlock, sportStoriesBlock)
        }

        then("I should not see a link to the same piece of content twice")

        val topStories = front()(0)
        val sport = front()(1)

        topStories.trails.contains(duplicateStory) should be(true)

        sport.trails.contains(duplicateStory) should be(false)
        sport.trails should have length (9)
      }
    }

    scenario("do not de-duplicate from hidden trails") {

      given("I am on the Network Front and I have not expanded any blocks")

      Fake {
        val duplicateStory = StubTrail("http://www.gu.com/1234")

        val description = TrailblockDescription("", "Name", 5)
        //duplicate trail is hidden behind "more" button
        val topTrails = createTrails("news", 5) ::: duplicateStory :: createTrails("world", 4)

        val topStoriesBlock = new TrailblockAgent(description, "UK") {
          override lazy val trailblock = Some(Trailblock(description, topTrails))
        }

        val sportStoriesBlock = new TrailblockAgent(description, "UK") {
          override lazy val trailblock = Some(Trailblock(description, duplicateStory :: createTrails("sport", 9)))
        }

        val front = new FrontEdition("UK", Nil) {
          override val manualAgents = Seq(topStoriesBlock, sportStoriesBlock)
        }

        then("I should see a link that is a duplicate of a link that is hidden")

        val topStories = front()(0)
        val sport = front()(1)

        topStories.trails.contains(duplicateStory) should be(true)

        sport.trails.contains(duplicateStory) should be(true)
        sport.trails should have length (10)
      }
    }

    scenario("Default front trailblock configuration") {

      given("I visit the network front")

      then("I should see 10 (5 of whch are hidden) Top stories")
      Front.uk.descriptions(0) should be(TrailblockDescription("", "News", 5, 2))
      Front.us.descriptions(0) should be(TrailblockDescription("", "News", 5, 2))

      and("I should see 10 (5 of which are hidden) Sport (Sports in US) stories")
      Front.uk.descriptions(1) should be(TrailblockDescription("sport", "Sport", 5, 1))
      Front.us.descriptions(1) should be(TrailblockDescription("sport", "Sports", 5, 1))

      and("I should see 6 (3 of which are hidden) Comment is Free stories")
      Front.uk.descriptions(2) should be(TrailblockDescription("commentisfree", "Comment is free", 3, 0))
      Front.us.descriptions(2) should be(TrailblockDescription("commentisfree", "Comment is free", 3, 0))

      and("I should see 1 Culture story")
      Front.uk.descriptions(3) should be(TrailblockDescription("culture", "Culture", 1))
      Front.us.descriptions(3) should be(TrailblockDescription("culture", "Culture", 1))

      and("I should see 1 Business story")
      Front.uk.descriptions(4) should be(TrailblockDescription("business", "Business", 1))
      Front.us.descriptions(4) should be(TrailblockDescription("business", "Business", 1))

      and("I should see 1 Life and Style story")
      Front.uk.descriptions(5) should be(TrailblockDescription("lifeandstyle", "Life and style", 1))
      Front.us.descriptions(5) should be(TrailblockDescription("lifeandstyle", "Life and style", 1))

      and("I should see 1 Money story")
      Front.uk.descriptions(6) should be(TrailblockDescription("money", "Money", 1))
      Front.us.descriptions(6) should be(TrailblockDescription("money", "Money", 1))

      and("I should see 1 Travel story")
      Front.uk.descriptions(7) should be(TrailblockDescription("travel", "Travel", 1))
      Front.us.descriptions(7) should be(TrailblockDescription("travel", "Travel", 1))
    }

    //this is so that the load balancer knows this server has a problem
    scenario("Return error if front is empty") {

      given("I visit the network front")
      and("it is empty")

      Fake {
        val controller = new FrontController {
          override val front = new Front() {
            override def apply(edition: String) = FrontPage(Seq.empty)
          }
        }

        then("I should see an internal server error")
        controller.render()(FakeRequest()).asInstanceOf[SimpleResult[AnyContent]].header.status should be(500)
      }
    }
  }

  private def createTrails(section: String, numTrails: Int) = (1 to numTrails).toList map {
    i => StubTrail("http://gu.com/" + section + "/" + i)
  }
}

private case class StubTrail(url: String) extends Trail {
  override def webPublicationDate = new DateTime()

  override def linkText = ""

  override def trailText = None

  override def section = ""

  override def sectionName = ""

  override def thumbnail = None

  override def images = Nil

  override def isLive = false
}
