package test

import org.scalatest.{DoNotDiscover, FlatSpec, Matchers}
import scala.collection.JavaConverters._

@DoNotDiscover class InteractiveTemplateTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  "Interactive html template" should "show the twitter card meta-data" in goTo(
    "/us-news/ng-interactive/2015/apr/13/marco-rubio-campaign-resume-guardian",
  ) { browser =>
    import browser._
    $("meta[name='twitter:card']").attributes("content").asScala.head should be("summary_large_image")
    $("meta[name='twitter:title']").attributes("content").asScala.head should be(
      "Get to know Marco Rubio, your latest (experienced!) candidate for president",
    )
  }
}
