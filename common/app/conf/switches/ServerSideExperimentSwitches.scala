package conf.switches

import conf.switches.Expiry.never
import experiments.ActiveExperiments

trait ServerSideExperimentSwitches {
  val ServerSideExperiments = {

    // It is not clear why the following instruction is needed.
    // It was added in this PR https://github.com/guardian/frontend/pull/8886/files
    // It would be nice if somebody could one day clarify the Scala voodoo at play here.
    // Until then, keep it for safety
    val experiments = ActiveExperiments.allExperiments

    Switch(
      SwitchGroup.ServerSideExperiments,
      "server-side-experiments",
      "Enables server side experiments",
      owners = Seq(Owner.withName("unknown")),
      safeState = Off,
      sellByDate = never,
      exposeClientSide = false,
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
  )

}
