package model.commercial.soulmates

import common.ExecutionContexts
import org.scalatest.Matchers
import org.scalatest.FlatSpec
import play.api.libs.json.Json

class SoulmatesApiTest extends FlatSpec with Matchers with ExecutionContexts {

  "parse" should "parse members from json feed" in {
    val members = SoulmatesApi.parse(Json.parse(Fixtures.Popular.json))

    members should be(Fixtures.Popular.members)
  }

}
