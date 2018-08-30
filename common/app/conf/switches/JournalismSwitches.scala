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

  val PodcastContainerSwitch = Switch(
    SwitchGroup.Journalism,
    "ab-podcast-container",
    "Test designs for a /uk podcasts container",
    owners = Seq(Owner.withName("journalism team")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val AudioOnwardJourneySwitch = Switch(
    SwitchGroup.Journalism,
    "audio-onward-journey-switch",
    "Display latest podcast episodes on audio pages",
    owners = Seq(Owner.withName("journalism team")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val FootballWeeklyPlayerTest = Switch(
    SwitchGroup.Journalism,
    "football-weekly-player-test",
    "Test in-article player in football content",
    owners = Seq(Owner.withName("journalism team")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )
}
