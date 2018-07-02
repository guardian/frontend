package conf.switches

import conf.switches.Expiry.never

trait JournalismSwitches {
  val AtomRendererSwitch = Switch(
    SwitchGroup.Journalism,
    "atom-renderer",
    "Renders atoms using the atom rendering library",
    owners = Seq(Owner.withName("journalism team")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val FootballWeeklyTreatVsContainerSwitch = Switch(
    SwitchGroup.Journalism,
    "ab-football-weekly-treat-vs-container",
    "Display treat linking to latest Football Weekly in UK network front",
    owners = Seq(Owner.withName("journalism team")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )
}
