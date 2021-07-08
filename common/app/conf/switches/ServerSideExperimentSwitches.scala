package conf.switches

import conf.switches.Expiry.never

trait ServerSideExperimentSwitches {
  val ServerSideExperiments = Switch(
    SwitchGroup.ServerSideExperiments,
    "server-side-experiments",
    "Enables server side experiments",
    owners = Seq(Owner.withGithub("shtukas")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false,
  )
}
