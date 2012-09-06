package test

import org.scalatest.FeatureSpec
import org.scalatest.GivenWhenThen
import org.scalatest.matchers.ShouldMatchers
import controllers.{ FrontEdition, Front, TrailblockAgent }
import model._
import org.joda.time.DateTime
import model.Trailblock
import model.TrailblockDescription

class FrontFeatureTest extends FeatureSpec with GivenWhenThen with ShouldMatchers {

  feature("Network Front") {

    info("In order to explore the breaking news and navigate to site sections")
    info("As a Guardian reader")
    info("I want a single page that gives me a summary of the latest news")
    info("And has a summary and navigation to site sections")

    //Metrics
    info("Increase engagement (% of people continuing to a piece of content)")
    info("Page views should *not* decrease.")
    info("Increase repeat visits")

    scenario("display top stories") {
      given("I visit the Network Front")

      Fake {

        //in real life these will always be editors picks only (content api does not do latest for front)
        val agent = TrailblockAgent("", "Top Stories", 5, "UK")

        agent.refresh()
        agent.await(2000)

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
        val agent = TrailblockAgent("lifeandstyle/seasonal-food", "Seasonal food", 5, "UK")

        agent.refresh()
        agent.await(2000)

        val trails = agent.trailblock.get.trails

        then("I should see the latest trails for a block that has no editors picks")
        trails should have length (20) //if only latest you just get 20 latest, hence exact length
      }
    }

    scenario("load editors picks and latest") {
      given("I visit the Network Front")

      Fake {

        //in real life this will be a combination of editors picks + latest
        val agent = TrailblockAgent("sport", "Sport", 5, "UK")

        agent.refresh()
        agent.await(2000)

        val trails = agent.trailblock.get.trails

        then("I should see a combination of editors picks and latest")
        trails.length should be > 20 //if it is a combo you get editors picks + 20 latest, hence > 20
      }
    }

    scenario("de-duplicate trails") {

      given("I am on the Network Front and I have not expanded any blocks")

      val DuplicateStory = StubTrail("http://www.gu.com/1234")

      val description = TrailblockDescription("", "Name", 5)

      val topStoriesBlock = new TrailblockAgent(description, "UK") {
        override lazy val trailblock = Some(Trailblock(description, Seq(DuplicateStory, StubTrail("http://1"), StubTrail("http://2"))))
      }

      val sportStoriesBlock = new TrailblockAgent(description, "UK") {
        override lazy val trailblock = Some(Trailblock(description, Seq(StubTrail("http://3"), DuplicateStory, StubTrail("http://4"))))
      }

      val front = new FrontEdition(Seq(topStoriesBlock, sportStoriesBlock))

      then("I should not see a link to the same piece of content twice")

      front()(0).trails.contains(DuplicateStory) should be(true)
      front()(1).trails.contains(DuplicateStory) should be(false)

      front()(1).trails should have length (2)
    }
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
}
