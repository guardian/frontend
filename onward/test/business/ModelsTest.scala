package business

import common.ResourcesHelper
import org.scalatest.{ShouldMatchers, FlatSpec}
import play.api.libs.json.{JsError, Json}

class ModelsTest extends FlatSpec with ShouldMatchers with ResourcesHelper {
  "models" should "correctly deserialize" in {
    val json = slurpJsonOrDie[Indices]("business-indices.json")

    json.indices.size shouldEqual 2

    val index = json.indices.head

    index.ticker shouldEqual ".FTSE"
    index.value.price shouldEqual "6323.48"
    index.value.change.trendday shouldEqual "-"
  }
}
