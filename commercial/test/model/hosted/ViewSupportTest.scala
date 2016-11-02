package commercial.model.hosted

import org.scalatest.{FlatSpec, Matchers}
import play.api.test.{FakeHeaders, FakeRequest}

class ViewSupportTest extends FlatSpec with Matchers {

  "origin" should "be empty locally" in {
    ViewSupport.origin("") shouldBe None
  }

  it should "be secure in an insecure environment" in {
    ViewSupport.origin("http://www.theguardian.com") shouldBe Some("https://www.theguardian.com")
  }

  it should "be secure in a secure environment" in {
    ViewSupport.origin("http://www.theguardian.com") shouldBe Some("https://www.theguardian.com")
  }
}
