package conf.switches

import conf.switches.Expiry.never

trait ServerSideABTestSwitches {
  // Server-side A/B Tests
  val ServerSideTests = {

    Switch(
      SwitchGroup.ServerSideABTests,
      "server-side-tests",
      "Enables the server side testing system",
      owners = Seq(Owner.withGithub("johnduffell")),
      safeState = Off,
      sellByDate = never,
      exposeClientSide = false
    )
  }

}
