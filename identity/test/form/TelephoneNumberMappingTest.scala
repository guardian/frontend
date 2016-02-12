package form

import org.scalatest.{Matchers, WordSpec}

class TelephoneNumberMappingTest extends WordSpec with Matchers {

  "Telephone Number Form Data" should {
    "be valid if neither country code or local number is provided" in {
      TelephoneNumberFormData(None, None).isValid shouldBe true
    }

    "be valid if a valid international number is provided" in {
      TelephoneNumberFormData(Some("44"), Some("020 3353 2000")).isValid shouldBe true
    }

    "be invalid if country code is provided and local number is not" in {
      TelephoneNumberFormData(Some("44"), None).isValid shouldBe false
    }

    "be invalid if country code is not provided and local number is" in {
      TelephoneNumberFormData(None, Some("020 3353 2000")).isValid shouldBe false
    }

    "be invalid if an invalid international number is provided" in {
      TelephoneNumberFormData(Some("44"), Some("12345")).isValid shouldBe false
    }
  }

}
