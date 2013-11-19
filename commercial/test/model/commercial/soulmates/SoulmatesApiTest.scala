package model.commercial.soulmates

import scala.concurrent.{Await, Future}
import common.ExecutionContexts
import scala.concurrent.duration._
import org.scalatest.Matchers
import org.scalatest.FlatSpec
import play.api.libs.json.Json

class SoulmatesApiTest extends FlatSpec with Matchers with ExecutionContexts {

  "parse" should "parse members from json feed" in {
    val members = SoulmatesApi.parse(Future {
      Json.parse(Fixtures.Popular.json)
    })

    Await.result(members, atMost = 1.seconds) should be(Fixtures.Popular.members)
  }

}
