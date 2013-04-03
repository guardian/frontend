package test

import conf.FootballClient
import org.scalatest.FlatSpec
import org.scalatest.matchers.ShouldMatchers

class FootballClientSanityTest extends FlatSpec with ShouldMatchers {

  "Developers" must "not check in a bad FootballClient url" in {
    // this ensures that you do not accidentally check in an override url in the Football client
    // that you are using for local development
    FootballClient.base should be("http://pads6.pa-sport.com")
  }
}