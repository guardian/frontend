package conf.switches

import conf.switches.Expiry.never

trait ServerSideExperimentSwitches {
  val ServerSideExperiments = {
    Switch(
      SwitchGroup.ServerSideExperiments,
      "server-side-tests",
      "Enables the server side testing system",
      owners = Seq(Owner.withGithub("johnduffell")),
      safeState = Off,
      sellByDate = never,
      exposeClientSide = false,
    )
  }
}
