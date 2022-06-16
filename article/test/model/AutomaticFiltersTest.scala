package model

import model.ParseBlockId.ParsedBlockId
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import model.TopMentionEntity.TopMentionEntity

import java.time.Duration

class AutomaticFiltersTest extends AnyFlatSpec with Matchers {
  "getAutomaticFilter" should "return none when no filter is provided" in {
    val result = AutomaticFilters.getAutomaticFilter(None)

    result should be(None)
  }

  it should "return none when an invalid string is provided" in {
    val filter = Some("random string")
    val result = AutomaticFilters.getAutomaticFilter(filter)

    result should be(None)
  }

  it should "return none when a filter that does not exist is provided" in {
    val filter = Some("organization:nhs")
    val result = AutomaticFilters.getAutomaticFilter(filter)

    result should be(None)
  }

  it should "return a some given an correct filter entity format, no matter if entity type is lowercase or uppercase" in {
    val filters = Seq(
      TestCase("ORG:someEntityValue", (TopMentionEntity.Org, "someEntityValue")),
      TestCase("Org:someEntityValue", (TopMentionEntity.Org, "someEntityValue")),
      TestCase("Product:someEntityValue", (TopMentionEntity.Product, "someEntityValue")),
      TestCase("PRODUCT:someEntityValue", (TopMentionEntity.Product, "someEntityValue")),
      TestCase("person:someEntityValue", (TopMentionEntity.Person, "someEntityValue")),
    )
    filters foreach { filter =>
      val result = AutomaticFilters.getAutomaticFilter(Some(filter.filter))
      result should be(Some(filter.result._1, filter.result._2))
    }
  }
}

case class TestCase(val filter: String, val result: (TopMentionEntity, String))
