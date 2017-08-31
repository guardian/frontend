package model

import org.scalatest.{Matchers, FlatSpec}

class PhoneNumbersTest extends FlatSpec with Matchers {

  behavior of "PhoneNumbers"

  it should "correct country codes" in {
    PhoneNumbers.countryCodes.contains(1) should be(true)
    PhoneNumbers.countryCodes.contains(44) should be(true)
    PhoneNumbers.countryCodes.contains(61) should be(true)
  }

}
