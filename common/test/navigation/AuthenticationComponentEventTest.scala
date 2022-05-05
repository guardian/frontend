package navigation

import org.scalatest.matchers.should.Matchers
import AuthenticationComponentEvent._
import org.scalatest.flatspec.AnyFlatSpec

class AuthenticationComponentEventTest extends AnyFlatSpec with Matchers {

  "createAuthenticationComponentEventTuple" should "create a component event tuple with the parameters passed" in {
    createAuthenticationComponentEventTuple(
      SigninHeaderId,
    ) shouldBe "componentEventParams" -> "componentType=identityauthentication&componentId=guardian_signin_header"
  }

  "createAuthenticationComponentEventParams" should "create component event parameters with the parameters passed" in {
    createAuthenticationComponentEventParams(
      SigninHeaderId,
    ) shouldBe "componentEventParams=componentType%3Didentityauthentication%26componentId%3Dguardian_signin_header"
  }

}
