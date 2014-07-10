package dev

import play.api.test.FakeRequest

trait HttpSwitchHelper {
  val requestWithNoSwitches = FakeRequest("GET", "/")
  val requestWithSwitchesOn = FakeRequest("GET", "/").copy(queryString = Map("switchesOn" -> List("switch1", "switch2")))
  val requestWithSwitchesOff = FakeRequest("GET", "/").copy(queryString = Map("switchesOff" -> List("switch2", "switch3")))
  val requestWithSwitchesOnAndOff = FakeRequest("GET", "/").copy(queryString = Map(
    "switchesOn" -> List("switch1", "switch2"),
    "switchesOff" -> List("switch2", "switch3")))

  val httpSwitchInProd = new HttpSwitchParameters with ProdEnvConfig
  val httpSwitchInNonProd = new HttpSwitchParameters with NonProdEnvConfig

  trait ProdEnvConfig extends EnvConfig {
    override def isNonProd = false
  }

  trait NonProdEnvConfig extends EnvConfig {
    override def isNonProd = true
  }
}
