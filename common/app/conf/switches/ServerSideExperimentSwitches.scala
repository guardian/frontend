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
      owners = Seq(Owner.withGithub("shtukas")),
      safeState = Off,
      sellByDate = never,
      exposeClientSide = false,
    )
  }

  val InteractiveLibrarianAdminRoutes = Switch(
    SwitchGroup.Feature,
    "interactive-librarian-admin-routes",
    "Enables the Interactive Librarian routes for pressing and cleaning (use only if you know what you're doing).",
    owners = Seq(Owner.withGithub("shtukas")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false,
  )
}
