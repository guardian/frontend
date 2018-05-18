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

  val PoliticsWeeklyTreatSwitch = Switch(
    SwitchGroup.Journalism,
    "ab-politics-weekly-treat",
    "Display treat linking to latest Politics Weekly in UK network front",
    owners = Seq(Owner.withName("journalism team")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )
}
