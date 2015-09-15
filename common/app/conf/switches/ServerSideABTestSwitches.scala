package conf.switches

import conf.switches.Expiry.never

trait ServerSideABTestSwitches {
  // Server-side A/B Tests
  val ServerSideTests = {
    // It's for the side effect. Blame agents.
    val tests = mvt.ActiveTests.tests

    Switch(
      "Server-side A/B Tests",
      "server-side-tests",
      "Enables the server side testing system",
      safeState = Off,
      sellByDate = never,
      exposeClientSide = false
    )
  }

}
