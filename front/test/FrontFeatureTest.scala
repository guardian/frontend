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
import views.support.{ Featured, Thumbnail, Headline }

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
          findFirst("[data-link-name=UK]").href should endWith("http://www.guardian.co.uk?mobile-redirect=false")
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
      Front.ukEditions("front").descriptions(0) should be(TrailblockDescription("", "News", 5, 2, style = Some(Featured)))
      Front.usEditions("front").descriptions(0) should be(TrailblockDescription("", "News", 5, 2, style = Some(Featured)))

      and("I should see 10 (5 of which are hidden) Sport (Sports in US) stories")
      Front.ukEditions("front").descriptions(1) should be(TrailblockDescription("sport", "Sport", 5, 1, style = Some(Featured)))
      Front.usEditions("front").descriptions(1) should be(TrailblockDescription("sport", "Sports", 5, 1, style = Some(Featured)))

      and("I should see 6 (3 of which are hidden) Comment is Free stories")
      Front.ukEditions("front").descriptions(2) should be(TrailblockDescription("commentisfree", "Comment is free", 3, 0, style = Some(Featured)))
      Front.usEditions("front").descriptions(2) should be(TrailblockDescription("commentisfree", "Comment is free", 3, 0, style = Some(Featured)))

      and("I should see 1 Culture story")
      Front.ukEditions("front").descriptions(3) should be(TrailblockDescription("culture", "Culture", 1, style = Some(Thumbnail)))
      Front.usEditions("front").descriptions(3) should be(TrailblockDescription("culture", "Culture", 1, style = Some(Thumbnail)))

      and("I should see 1 Business story")
      Front.ukEditions("front").descriptions(4) should be(TrailblockDescription("business", "Business", 1, style = Some(Thumbnail)))
      Front.usEditions("front").descriptions(4) should be(TrailblockDescription("business", "Business", 1, style = Some(Thumbnail)))

      and("I should see 1 Life and Style story")
      Front.ukEditions("front").descriptions(5) should be(TrailblockDescription("lifeandstyle", "Life and style", 1, style = Some(Thumbnail)))
      Front.usEditions("front").descriptions(5) should be(TrailblockDescription("lifeandstyle", "Life and style", 1, style = Some(Thumbnail)))

      and("I should see 1 Money story")
      Front.ukEditions("front").descriptions(6) should be(TrailblockDescription("money", "Money", 1, style = Some(Thumbnail)))
      Front.usEditions("front").descriptions(6) should be(TrailblockDescription("money", "Money", 1, style = Some(Thumbnail)))

      and("I should see 1 Travel story")
      Front.ukEditions("front").descriptions(7) should be(TrailblockDescription("travel", "Travel", 1, style = Some(Thumbnail)))
      Front.usEditions("front").descriptions(7) should be(TrailblockDescription("travel", "Travel", 1, style = Some(Thumbnail)))
    }

    /**
     * Football section front
     */
    scenario("Footbll section front contains the top 10 stories across sport") {

      given("I am on the 'sport' section front")

      then("I should see the top 10 stories across sport")
      Front.ukEditions("sport").descriptions(0) should be(TrailblockDescription("sport", "Sport", 5, style = Some(Featured)))
      Front.usEditions("sport").descriptions(0) should be(TrailblockDescription("sport", "Sports", 5, style = Some(Featured)))
    }

    scenario("Sub-sections on the Sport section front show a number of top stories") {

      given("I am on the 'sport' section front")

      then("the 'Football' sub-section should contain up to 6 stories")
      Front.ukEditions("sport").descriptions(1) should be(TrailblockDescription("football", "Football", 3, style = Some(Featured)))

      and("the 'Cricket' sub-section should contain up to 1 story")
      Front.ukEditions("sport").descriptions(2) should be(TrailblockDescription("sport/cricket", "Cricket", 1, style = Some(Thumbnail)))

      and("the 'Rugby Union' sub-section should contain up to 1 story")
      Front.ukEditions("sport").descriptions(3) should be(TrailblockDescription("sport/rugby-union", "Rugby Union", 1, style = Some(Thumbnail)))

      and("the 'Motor Sport' sub-section should contain up to 1 story")
      Front.ukEditions("sport").descriptions(4) should be(TrailblockDescription("sport/motorsports", "Motor Sport", 1, style = Some(Thumbnail)))

      and("the 'Tennis' sub-section should contain up to 1 story")
      Front.ukEditions("sport").descriptions(5) should be(TrailblockDescription("sport/tennis", "Tennis", 1, style = Some(Thumbnail)))

      and("the 'Golf' sub-section should contain up to 1 story")
      Front.ukEditions("sport").descriptions(6) should be(TrailblockDescription("sport/golf", "Golf", 1, style = Some(Thumbnail)))

      and("the 'Horse Racing' sub-section should contain up to 1 story")
      Front.ukEditions("sport").descriptions(7) should be(TrailblockDescription("sport/horse-racing", "Horse Racing", 1, style = Some(Headline)))

      and("the 'Rugby League' sub-section should contain up to 1 story")
      Front.ukEditions("sport").descriptions(8) should be(TrailblockDescription("sport/rugbyleague", "Rugby League", 1, style = Some(Headline)))

      and("the 'US Sport' sub-section should contain up to 1 story")
      Front.ukEditions("sport").descriptions(9) should be(TrailblockDescription("sport/us-sport", "US Sport", 1, style = Some(Headline)))

      and("the 'Boxing' sub-section should contain up to 1 story")
      Front.ukEditions("sport").descriptions(10) should be(TrailblockDescription("sport/boxing", "Boxing", 1, style = Some(Headline)))

      and("the 'Cycling' sub-section should contain up to 1 story")
      Front.ukEditions("sport").descriptions(11) should be(TrailblockDescription("sport/cycling", "Cycling", 1, style = Some(Headline)))

      then("the 'NFL' sub-section should contain up to 6 stories (US)")
      Front.usEditions("sport").descriptions(1) should be(TrailblockDescription("sport/nfl", "NFL", 3, style = Some(Featured)))

      and("the 'MLB' sub-section should contain up to 1 story (US)")
      Front.usEditions("sport").descriptions(2) should be(TrailblockDescription("sport/mlb", "MLB", 1, style = Some(Thumbnail)))

      and("the 'NBA' sub-section should contain up to 1 story (US)")
      Front.usEditions("sport").descriptions(3) should be(TrailblockDescription("sport/nba", "NBA", 1, style = Some(Thumbnail)))

      and("the 'MLS' sub-section should contain up to 1 story (US)")
      Front.usEditions("sport").descriptions(4) should be(TrailblockDescription("football/mls", "MLS", 1, style = Some(Thumbnail)))

      and("the 'NHL' sub-section should contain up to 1 story (US)")
      Front.usEditions("sport").descriptions(5) should be(TrailblockDescription("sport/nhl", "NHL", 1, style = Some(Thumbnail)))
    }

    /**
     * Culture section front
     */
    scenario("Culture section front contains the top 10 stories across culture") {

      given("I am on the 'culture' section front")

      then("I should see the top 10 stories across culture")
      Front.ukEditions("culture").descriptions(0) should be(TrailblockDescription("culture", "Culture", 5, style = Some(Featured)))
      Front.usEditions("culture").descriptions(0) should be(TrailblockDescription("culture", "Culture", 5, style = Some(Featured)))
    }

    scenario("Sub-sections on the Culture section front show a number of top stories") {

      given("I am on the 'culture' section front")

      then("the 'TV & Radio' sub-section should contain up to 1 story")
      Front.ukEditions("culture").descriptions(1) should be(TrailblockDescription("tv-and-radio", "TV & Radio", 1, style = Some(Thumbnail)))
      Front.usEditions("culture").descriptions(1) should be(TrailblockDescription("tv-and-radio", "TV & Radio", 1, style = Some(Thumbnail)))

      then("the 'Film' sub-section should contain up to 1 story")
      Front.ukEditions("culture").descriptions(2) should be(TrailblockDescription("film", "Film", 1, style = Some(Thumbnail)))
      Front.usEditions("culture").descriptions(2) should be(TrailblockDescription("film", "Film", 1, style = Some(Thumbnail)))

      then("the 'Music' sub-section should contain up to 1 story")
      Front.ukEditions("culture").descriptions(3) should be(TrailblockDescription("music", "Music", 1, style = Some(Thumbnail)))
      Front.usEditions("culture").descriptions(3) should be(TrailblockDescription("music", "Music", 1, style = Some(Thumbnail)))

      then("the 'Stage' sub-section should contain up to 1 story")
      Front.ukEditions("culture").descriptions(4) should be(TrailblockDescription("stage", "Stage", 1, style = Some(Thumbnail)))
      Front.usEditions("culture").descriptions(4) should be(TrailblockDescription("stage", "Stage", 1, style = Some(Thumbnail)))

      then("the 'Books' sub-section should contain up to 1 story")
      Front.ukEditions("culture").descriptions(5) should be(TrailblockDescription("books", "Books", 1, style = Some(Headline)))
      Front.usEditions("culture").descriptions(5) should be(TrailblockDescription("books", "Books", 1, style = Some(Headline)))

      then("the 'Art & Design' sub-section should contain up to 1 story")
      Front.ukEditions("culture").descriptions(6) should be(TrailblockDescription("artanddesign", "Art & Design", 1, style = Some(Headline)))
      Front.usEditions("culture").descriptions(6) should be(TrailblockDescription("artanddesign", "Art & Design", 1, style = Some(Headline)))

      then("the 'Games' sub-section should contain up to 1 story")
      Front.ukEditions("culture").descriptions(7) should be(TrailblockDescription("technology/games", "Games", 1, style = Some(Headline)))
      Front.usEditions("culture").descriptions(7) should be(TrailblockDescription("technology/games", "Games", 1, style = Some(Headline)))
    }

    // this is so that the load balancer knows this server has a problem
    scenario("Return error if front is empty") {

      given("I visit the network front")
      and("it is empty")

      Fake {
        val controller = new FrontController {
          override val front = new Front() {
            override def apply(path: String, edition: String) = Nil
          }
        }

        then("I should see an internal server error")
        controller.render("front")(FakeRequest()).asInstanceOf[SimpleResult[AnyContent]].header.status should be(500)
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

  override def headline = ""

  override def trailText = None

  override def section = ""

  override def sectionName = ""

  override def thumbnail = None

  override def images = Nil

  override def isLive = false
}
