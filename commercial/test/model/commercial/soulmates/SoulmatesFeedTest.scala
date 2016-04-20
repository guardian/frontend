package model.commercial.soulmates

import common.ExecutionContexts
import org.scalatest.{DoNotDiscover, FlatSpec, Matchers}
import play.api.libs.json.Json
import test.ConfiguredTestSuite

@DoNotDiscover class SoulmatesFeedTest extends FlatSpec with Matchers with ExecutionContexts with ConfiguredTestSuite {

  private val api = new SoulmatesFeed {
    lazy val path: String = "test"
    val adTypeName: String = "test"
  }

  "parse" should "parse members from json feed" in {
    val members = api.parse(Json.parse(Fixtures.Popular.json))

    members should be(Fixtures.Popular.members)
  }

}
