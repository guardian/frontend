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

  val AudioOnwardJourneySwitch = Switch(
    SwitchGroup.Journalism,
    "audio-onward-journey-switch",
    "Display latest podcast episodes on audio pages",
    owners = Seq(Owner.withName("journalism team")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val InArticlePlayerTest = Switch(
    SwitchGroup.Journalism,
    "in-article-player-test",
    "Test in-article player in relevant tagged content",
    owners = Seq(Owner.withName("journalism team")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val FlagshipEmailContainerSwitch = Switch(
    SwitchGroup.Journalism,
    "flagship-email-container",
    "Display the Flagship podcast container in the daily emails",
    owners = Seq(Owner.withName("journalism team")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val FlagshipFrontContainerSwitch = Switch(
    SwitchGroup.Journalism,
    "flagship-front-container",
    "Display the Flagship podcast container on the /uk front",
    owners = Seq(Owner.withName("journalism team")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )
}
