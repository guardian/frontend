package com.gu.identity.integration.test.util

import com.gu.identity.integration.test.pages.EditAccountDetailsModule

case class User(userName: String,
                email: String,
                pwd: Option[String],
                firstName: Option[String] = None,
                lastName: Option[String] = None,
                addrLine1: Option[String] = None,
                addrLine2: Option[String] = None,
                town: Option[String] = None,
                county: Option[String] = None,
                postCode: Option[String] = None,
                country: Option[String] = None)

object User {
  def generateRandomUser(): User = {
    User(generateRandomAlphaNumericString(8), generateRandomEmail, Option(generateRandomAlphaNumericString(12)),
      Option(generateRandomAlphaNumericString(10)), Option(generateRandomAlphaNumericString(10)))
  }

  def generateRandomUserWith(userName: String): User = {
    User(userName, generateRandomEmail, Option(generateRandomAlphaNumericString(12)),
      Option(generateRandomAlphaNumericString(10)), Option(generateRandomAlphaNumericString(10)))
  }

  def fromEditAccountDetailsForm(accountDetails: EditAccountDetailsModule): User = {
    User(accountDetails.getSignInName, accountDetails.getEmailAddress(), None, Option(accountDetails.getFirstName()),
      Option(accountDetails.getLastName()), Option(accountDetails.getAddressLine1Field), Option(accountDetails.getAddressLine2Field),
      Option(accountDetails.getTownField), Option(accountDetails.getCountyField), Option(accountDetails.getPostCodeField),
      Option(accountDetails.getSelectedCountry))
  }

  def generateRandomEmail: String = {
    s"${generateRandomAlphaNumericString(10)}@fake.me"
  }

  def generateRandomAlphaNumericString(nrOfChars: Int): String = {
    val random = new scala.util.Random
    random.alphanumeric.take(nrOfChars).mkString
  }
}
