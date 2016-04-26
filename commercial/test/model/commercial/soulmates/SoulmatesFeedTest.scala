package model.commercial.soulmates

import common.ExecutionContexts
import org.scalatest.{FlatSpec, Matchers}
import play.api.libs.json.Json

class SoulmatesFeedTest extends FlatSpec with Matchers with ExecutionContexts {

  private val api = new SoulmatesFeed {
    lazy val path: String = "test"
    val adTypeName: String = "test"
  }

  "parse" should "parse members from json feed" in {
    val members = api.parse(Json.parse(Fixtures.Popular.json))

    members should be(Fixtures.Popular.members)
  }

}
