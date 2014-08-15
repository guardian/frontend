package com.gu.identity.integration.test.util

case class User(userName: String, email: String, pwd: String)

object User {
  def generateRandomUser(): User = {
    User(generateRandomAlphaNumericString(6), generateRandomEmail, "123password123")
  }

  def generateRandomEmail: String = {
    s"${generateRandomAlphaNumericString(10)}@fake.me"
  }
  private def generateRandomAlphaNumericString(nrOfChars: Int): String = {
    val random = new scala.util.Random
    val alphaNumericBucket = "abcdefghijklmnopqrstuvwxyz0123456789"
    Stream.continually(random.nextInt(alphaNumericBucket.size)).map(alphaNumericBucket).take(nrOfChars).mkString
  }
}
