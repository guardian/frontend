package model

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class PhoneNumbersTest extends AnyFlatSpec with Matchers {

  behavior of "PhoneNumbers"

  it should "correct country codes" in {
    PhoneNumbers.countryCodes.contains(1) should be(true)
    PhoneNumbers.countryCodes.contains(44) should be(true)
    PhoneNumbers.countryCodes.contains(61) should be(true)
  }

}
