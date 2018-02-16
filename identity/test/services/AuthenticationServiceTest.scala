package services

import idapiclient.{ScGuRp, ScGuU}
import org.mockito.Matchers
import org.scalatest.mockito.MockitoSugar
import play.mvc.Http.RequestHeader

class AuthenticationServiceTest extends Matchers with MockitoSugar {


  trait TestFixture {
    val rpCookie = mock[ScGuRp]
    val scGuUCookie = mock[ScGuU]
  }

  "The Authentication Service" should {

    val req = RequestHeader

    "Return a recently authenticated user " in new TestFixture {

    }
  }
}
