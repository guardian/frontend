package model.dotcomrendering.pageElements

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class CalloutExtractionTest extends AnyFlatSpec with Matchers {
  "CalloutExtraction isCallout" should "return true when data-callout-tagname attribute exists in html and has value" in {
    val result = CalloutExtraction.isCallout("<div data-callout-tagname='someValue'>some stuff</div>")
    result should equal(true)
  }

  "CalloutExtraction isCallout" should "return false when data-callout-tagname attribute exists in html but doesn't have any value" in {
    val result = CalloutExtraction.isCallout("<div data-callout-tagname>some stuff</div>")
    result should equal(false)
  }

  it should "return false when data-callout-tagname attribute doesn't exist in html" in {
    val result = CalloutExtraction.isCallout("<div some-data='someValue'>some stuff</div>")
    result should equal(false)
  }
}
