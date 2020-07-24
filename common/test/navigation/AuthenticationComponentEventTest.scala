package navigation

import org.scalatest.{FlatSpec, Matchers}
import AuthenticationComponentEvent._

class AuthenticationComponentEventTest extends FlatSpec with Matchers {

  "createAuthenticationComponentEventTuple" should "create a component event tuple with the parameters passed" in {
    createAuthenticationComponentEventTuple(SigninHeaderId) shouldBe "componentEventParams" -> "componentType%3DIDENTITY_AUTHENTICATION%26componentId%3Dguardian_signin_header"
  }

  "createAuthenticationComponentEventParams" should "create component event parameters with the parameters passed" in {
    createAuthenticationComponentEventParams(SigninHeaderId) shouldBe "componentEventParams=componentType%3DIDENTITY_AUTHENTICATION%26componentId%3Dguardian_signin_header"
  }

}
