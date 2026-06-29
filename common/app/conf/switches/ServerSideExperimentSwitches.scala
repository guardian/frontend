package conf.switches

import conf.switches.Expiry.never

trait ServerSideExperimentSwitches {
  val ServerSideExperiments = {
    Switch(
      SwitchGroup.ServerSideExperiments,
      "server-side-experiments",
      "Enables server side experiments",
      owners = Seq(Owner.withName("unknown")),
      safeState = Off,
      sellByDate = never,
      exposeClientSide = false,
      highImpact = false,
    )
  }

  val ContentPresser = Switch(
    SwitchGroup.Feature,
    "content-presser",
    "Enables routes for pressing and cleaning articles and interactives.",
    owners = Seq(Owner.withName("unknown")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false,
    highImpact = false,
  )

}
