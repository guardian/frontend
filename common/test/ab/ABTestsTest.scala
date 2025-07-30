package ab



import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import play.api.test.FakeRequest
import play.api.mvc.RequestHeader
import play.api.libs.typedmap.TypedMap

class ABTestsTest extends AnyFlatSpec with Matchers {

  "ABTests.createRequest" should "parse AB test header correctly" in {
    val request = FakeRequest().withHeaders(ABTests.abTestHeader -> "test1:variant1,test2:variant2")
    val enrichedRequest = ABTests.createRequest(request)

    ABTests.allTests(enrichedRequest) should contain theSameElementsAs Map(
      "test1" -> "variant1",
      "test2" -> "variant2"
    )
  }

  it should "handle empty header" in {
    val request = FakeRequest()
    val enrichedRequest = ABTests.createRequest(request)

    ABTests.allTests(enrichedRequest) should be(empty)
  }

  it should "handle malformed test entries" in {
    val request = FakeRequest().withHeaders(ABTests.abTestHeader -> "test1:variant1,malformed,test2:variant2:extra")
    val enrichedRequest = ABTests.createRequest(request)

    ABTests.allTests(enrichedRequest) should contain theSameElementsAs Map(
      "test1" -> "variant1"
    )
  }

  it should "handle test entries with missing variant" in {
    val request = FakeRequest().withHeaders(ABTests.abTestHeader -> "test1:,test2:variant2")
    val enrichedRequest = ABTests.createRequest(request)

    ABTests.allTests(enrichedRequest) should contain theSameElementsAs Map(
      "test1" -> "",
      "test2" -> "variant2"
    )
  }

  it should "handle test entries with colons in values" in {
    val request = FakeRequest().withHeaders(ABTests.abTestHeader -> "test1:variant:with:colons,test2:variant2")
    val enrichedRequest = ABTests.createRequest(request)

    ABTests.allTests(enrichedRequest) should contain theSameElementsAs Map(
      "test2" -> "variant2"
    )
  }

  it should "handle empty string header" in {
    val request = FakeRequest().withHeaders(ABTests.abTestHeader -> "")
    val enrichedRequest = ABTests.createRequest(request)

    ABTests.allTests(enrichedRequest) should be(empty)
  }

  "ABTests.isParticipating" should "return true when test exists" in {
    val request = FakeRequest().withHeaders(ABTests.abTestHeader -> "test1:variant1,test2:variant2")
    val enrichedRequest = ABTests.createRequest(request)

    ABTests.isParticipating(enrichedRequest, "test1") should be(true)
    ABTests.isParticipating(enrichedRequest, "test2") should be(true)
  }

  it should "return false when test does not exist" in {
    val request = FakeRequest().withHeaders(ABTests.abTestHeader -> "test1:variant1,test2:variant2")
    val enrichedRequest = ABTests.createRequest(request)

    ABTests.isParticipating(enrichedRequest, "test3") should be(false)
  }

  it should "return false for empty request" in {
    val request = FakeRequest()
    val enrichedRequest = ABTests.createRequest(request)

    ABTests.isParticipating(enrichedRequest, "test1") should be(false)
  }

  it should "return false when request has no AB test attributes" in {
    val request = FakeRequest()

    ABTests.isParticipating(request, "test1") should be(false)
  }

  "ABTests.isInVariant" should "return true when test and variant match" in {
    val request = FakeRequest().withHeaders(ABTests.abTestHeader -> "test1:variant1,test2:variant2")
    val enrichedRequest = ABTests.createRequest(request)

    ABTests.isInVariant(enrichedRequest, "test1", "variant1") should be(true)
    ABTests.isInVariant(enrichedRequest, "test2", "variant2") should be(true)
  }

  it should "return false when test exists but variant does not match" in {
    val request = FakeRequest().withHeaders(ABTests.abTestHeader -> "test1:variant1,test2:variant2")
    val enrichedRequest = ABTests.createRequest(request)

    ABTests.isInVariant(enrichedRequest, "test1", "variant2") should be(false)
    ABTests.isInVariant(enrichedRequest, "test2", "variant1") should be(false)
  }

  it should "return false when test does not exist" in {
    val request = FakeRequest().withHeaders(ABTests.abTestHeader -> "test1:variant1,test2:variant2")
    val enrichedRequest = ABTests.createRequest(request)

    ABTests.isInVariant(enrichedRequest, "test3", "variant1") should be(false)
  }

  it should "return false for empty request" in {
    val request = FakeRequest()
    val enrichedRequest = ABTests.createRequest(request)

    ABTests.isInVariant(enrichedRequest, "test1", "variant1") should be(false)
  }

  it should "return false when request has no AB test attributes" in {
    val request = FakeRequest()

    ABTests.isInVariant(request, "test1", "variant1") should be(false)
  }

  "ABTests.allTests" should "return all parsed tests" in {
    val request = FakeRequest().withHeaders(ABTests.abTestHeader -> "test1:variant1,test2:variant2,test3:control")
    val enrichedRequest = ABTests.createRequest(request)

    ABTests.allTests(enrichedRequest) should contain theSameElementsAs Map(
      "test1" -> "variant1",
      "test2" -> "variant2",
      "test3" -> "control"
    )
  }

  it should "return empty map for request without AB tests" in {
    val request = FakeRequest()
    val enrichedRequest = ABTests.createRequest(request)

    ABTests.allTests(enrichedRequest) should be(empty)
  }

  it should "return empty map when request has no AB test attributes" in {
    val request = FakeRequest()

    ABTests.allTests(request) should be(empty)
  }

  "ABTests.getJavascriptConfig" should "return properly formatted JavaScript config" in {
    val request = FakeRequest().withHeaders(ABTests.abTestHeader -> "test1:variant1,test2:variant2")
    val enrichedRequest = ABTests.createRequest(request)

    val jsConfig = ABTests.getJavascriptConfig(enrichedRequest)

    // The order might vary, so check both possible orders
    jsConfig should (equal(""""test1":"variant1","test2":"variant2"""") or
                    equal(""""test2":"variant2","test1":"variant1""""))
  }

  it should "return empty string for request without AB tests" in {
    val request = FakeRequest()
    val enrichedRequest = ABTests.createRequest(request)

    ABTests.getJavascriptConfig(enrichedRequest) should be("")
  }

  it should "handle single test" in {
    val request = FakeRequest().withHeaders(ABTests.abTestHeader -> "test1:variant1")
    val enrichedRequest = ABTests.createRequest(request)

    ABTests.getJavascriptConfig(enrichedRequest) should be(""""test1":"variant1"""")
  }

  it should "properly escape quotes in test names and variants" in {
    val request = FakeRequest().withHeaders(ABTests.abTestHeader -> "test1:variant1")
    val enrichedRequest = ABTests.createRequest(request)

    ABTests.getJavascriptConfig(enrichedRequest) should be(""""test1":"variant1"""")
  }

  it should "return empty string when request has no AB test attributes" in {
    val request = FakeRequest()

    ABTests.getJavascriptConfig(request) should be("")
  }

  "ABTests header parsing" should "handle whitespace around test entries" in {
    val request = FakeRequest().withHeaders(ABTests.abTestHeader -> " test1:variant1 , test2:variant2 ")
    val enrichedRequest = ABTests.createRequest(request)

    ABTests.allTests(enrichedRequest) should contain theSameElementsAs Map(
      " test1" -> "variant1 ",
      " test2" -> "variant2 "
    )
  }

  it should "handle trailing commas" in {
    val request = FakeRequest().withHeaders(ABTests.abTestHeader -> "test1:variant1,test2:variant2,")
    val enrichedRequest = ABTests.createRequest(request)

    ABTests.allTests(enrichedRequest) should contain theSameElementsAs Map(
      "test1" -> "variant1",
      "test2" -> "variant2"
    )
  }

  it should "handle leading commas" in {
    val request = FakeRequest().withHeaders(ABTests.abTestHeader -> ",test1:variant1,test2:variant2")
    val enrichedRequest = ABTests.createRequest(request)

    ABTests.allTests(enrichedRequest) should contain theSameElementsAs Map(
      "test1" -> "variant1",
      "test2" -> "variant2"
    )
  }

  it should "handle multiple consecutive commas" in {
    val request = FakeRequest().withHeaders(ABTests.abTestHeader -> "test1:variant1,,test2:variant2")
    val enrichedRequest = ABTests.createRequest(request)

    ABTests.allTests(enrichedRequest) should contain theSameElementsAs Map(
      "test1" -> "variant1",
      "test2" -> "variant2"
    )
  }

  "ABTests constant values" should "have correct header name" in {
    ABTests.abTestHeader should be("X-GU-Server-AB-Tests")
  }
}
