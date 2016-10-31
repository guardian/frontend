package commercial.model.hosted

import org.scalatest.{FlatSpec, Matchers}
import play.api.test.{FakeHeaders, FakeRequest}

class ViewSupportTest extends FlatSpec with Matchers {

  private val insecureRequest = FakeRequest()

  private val secureRequest = FakeRequest(
    method = "GET",
    uri = "/",
    headers = FakeHeaders(),
    body = "",
    secure = true
  )

  "origin" should "be empty locally" in {
    ViewSupport.origin("")(insecureRequest) shouldBe None
  }

  it should "be insecure in an insecure environment" in {
    ViewSupport.origin("http://www.theguardian.com")(insecureRequest) shouldBe Some("http://www.theguardian.com")
  }

  it should "be secure in a secure environment" in {
    ViewSupport.origin("http://www.theguardian.com")(secureRequest) shouldBe Some("https://www.theguardian.com")
  }
}
