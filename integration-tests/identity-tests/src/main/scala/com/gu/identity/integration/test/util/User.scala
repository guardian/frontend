package com.gu.identity.integration.test.util

case class User(userName: String, email: String, pwd: String)

object User {
  def generateRandomUser(): User = {
    User(generateRandomAlphaNumericString(6), generateRandomEmail, generateRandomAlphaNumericString(12))
  }

  def generateRandomEmail: String = {
    s"${generateRandomAlphaNumericString(10)}@fake.me"
  }
  private def generateRandomAlphaNumericString(nrOfChars: Int): String = {
    val random = new scala.util.Random
    random.alphanumeric.take(nrOfChars).mkString
  }
}
