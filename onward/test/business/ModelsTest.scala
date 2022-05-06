package business

import common.ResourcesHelper
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class ModelsTest extends AnyFlatSpec with Matchers with ResourcesHelper {
  "models" should "correctly deserialize" in {
    val json = slurpJsonOrDie[Indices]("business-indices.json")

    json.indices.size shouldEqual 4

    val index = json.indices.head

    index.ticker shouldEqual ".FTSE"
    index.value.price shouldEqual "6,799.80"
    index.value.change.trendday shouldEqual "down"
  }
}
