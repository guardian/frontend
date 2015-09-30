package dev

import conf.switches.{Off, On, Switch}
import org.scalatest.{Matchers, FlatSpec}
import conf._
import org.joda.time.LocalDate

class HttpSwitchTest extends FlatSpec with Matchers with HttpSwitchHelper {

  private lazy val never = new LocalDate(2100, 1, 1)

  val httpOnSwitch = new HttpSwitch(Switch(
    "Feature Switches",
    "switch2",
    "What the switch is for",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )) with NonProdEnvConfig
  val httpOffSwitch = new HttpSwitch(Switch(
    "Feature Switches",
    "switch2",
    "What the switch is for",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )) with NonProdEnvConfig

  "HttpSwitch" should "not affect a Switch if no query parameters are present" in {
    implicit val request = requestWithNoSwitches

    httpOnSwitch.isSwitchedOn should be(true)
    httpOffSwitch.isSwitchedOn should be(false)
  }

  "HttpSwitch" should "not turn switches on if ON override present" in {
    implicit val request = requestWithSwitchesOn

    httpOnSwitch.isSwitchedOn should be(true)
    httpOffSwitch.isSwitchedOn should be(true)
  }

  "HttpSwitch" should "not turn switches off if OFF override present" in {
    implicit val request = requestWithSwitchesOff

    httpOnSwitch.isSwitchedOn should be(false)
    httpOffSwitch.isSwitchedOn should be(false)
  }

  "HttpSwitch" should "not switches on if both ON & OFF overrides present" in {
    implicit val request = requestWithSwitchesOnAndOff

    httpOnSwitch.isSwitchedOn should be(true)
    httpOffSwitch.isSwitchedOn should be(true)
  }

}
