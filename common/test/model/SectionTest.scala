package model

import com.gu.openplatform.contentapi.model.{Section => ApiSection}
import org.scalatest.{FlatSpec, Matchers}

class SectionTest extends FlatSpec with Matchers {

  private def toSection(id: String): Section = {
    val delegate = ApiSection(id,
      webTitle = "webTitle", webUrl = "webUrl", apiUrl = "apiUrl", editions = Nil)
    Section(delegate)
  }

  "keywordIds" should "be same as section keyword ID for content pages in section" in {

    toSection("culture").keywordIds should be(Seq("culture/culture"))

    toSection("sustainable-business/grundfos-partner-zone").keywordIds should be(Seq(
      "sustainable-business/grundfos-partner-zone",
      "sustainable-business-grundfos-partner-zone/sustainable-business-grundfos-partner-zone"))
  }

}
