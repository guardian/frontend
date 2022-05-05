package model

import common.ResourcesHelper
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class TagIndexPageTest extends AnyFlatSpec with Matchers with ResourcesHelper {
  val fixture = slurpJsonOrDie[TagIndex]("c.json")

  val cuba = TagDefinition(
    "Cuba",
    "travel/cuba",
    Some(
      SectionDefinition(
        "Travel",
        "travel",
      ),
    ),
    false,
  )

  val crownProsecutionService = TagDefinition(
    "Crown Prosecution Service",
    "law/crown-prosecution-service",
    None,
    false,
  )

  "hasDuplicateWebTitle" should "return true for tags whose web title occurs for another tag" in {
    fixture.hasDuplicateWebTitle(cuba) shouldEqual true
  }

  it should "return false for tags whose web title is unique" in {
    fixture.hasDuplicateWebTitle(crownProsecutionService) shouldEqual false
  }

  "indexTitle" should "return just the web title if it is unique" in {
    fixture.indexTitle(crownProsecutionService) shouldEqual "Crown Prosecution Service"
  }

  it should "return the web title and the section title, if the web title is not unique and a section exists" in {
    fixture.indexTitle(cuba) shouldEqual "Cuba, Travel"
  }
}
