package conf.switches

import conf.switches.Expiry.never
import experiments.ActiveExperiments

trait ServerSideExperimentSwitches {
  val ServerSideExperiments = {
    // It's for the side effect. Blame agents.
    val experiments = ActiveExperiments.allExperiments
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
