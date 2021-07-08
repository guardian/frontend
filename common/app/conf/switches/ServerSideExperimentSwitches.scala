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

  val InteractiveLibrarianAdminRoutes = Switch(
    SwitchGroup.ServerSideExperiments,
    "interactive-librarian-admin-routes",
    "Enables the Interactive Librarian routes for pressing and cleaning (use only if you know what you're doing).",
    owners = Seq(Owner.withGithub("shtukas")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false,
  )
}
