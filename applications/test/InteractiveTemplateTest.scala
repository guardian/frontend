package test

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.DoNotDiscover
import org.scalatest.matchers.should.Matchers

import scala.jdk.CollectionConverters._

@DoNotDiscover class InteractiveTemplateTest extends AnyFlatSpec with Matchers with ConfiguredTestSuite {

  "Interactive html template" should "show the twitter card meta-data" in goTo(
    "/us-news/ng-interactive/2015/apr/13/marco-rubio-campaign-resume-guardian?dcr=false",
  ) { browser =>
    import browser._
    $("meta[name='twitter:card']").attributes("content").asScala.head should be("summary_large_image")
    $("meta[name='twitter:title']").attributes("content").asScala.head should be(
      "Get to know Marco Rubio, your latest (experienced!) candidate for president",
    )
  }
}
