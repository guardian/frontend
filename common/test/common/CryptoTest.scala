package common

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class CryptoTest extends AnyFlatSpec with Matchers {

  val privateKey = "6FA3BE741DE87141F90EB3E67EB51976"
  val message = "Les sanglots longs des violons de l'automne blessent mon cœur d'une langueur monotone."

  "A valid encrypted string" should "be successfully decrypted" in {
    val encrypted = Crypto.encryptAES(message, privateKey)
    Crypto.decryptAES(encrypted, privateKey) should equal(message)
  }

  "A valid encrypted string created with the wrong key" should "not be successfully decrypted" in {
    val encrypted = Crypto.encryptAES(message, "this is not the appropriate key")
    Crypto.decryptAES(encrypted, privateKey) should not equal (message)
  }

  "A valid encrypted string" should "not be successfully decrypted with the wrong key" in {
    val encrypted = Crypto.encryptAES(message, privateKey)
    Crypto.decryptAES(encrypted, "this is not the appropriate key") should not equal (message)
  }
}
