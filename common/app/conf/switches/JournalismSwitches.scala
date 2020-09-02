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
    exposeClientSide = false,
  )

  val RenderInArticleAudioAtomSwitch = Switch(
    SwitchGroup.Journalism,
    "render-in-article-audio-atoms",
    "controls whether in-article audio atoms are displayed",
    owners = Seq(Owner.withName("journalism team")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false,
  )

  val AudioOnwardJourneySwitch = Switch(
    SwitchGroup.Journalism,
    "audio-onward-journey-switch",
    "Display latest podcast episodes on audio pages",
    owners = Seq(Owner.withName("journalism team")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

  val FlagshipEmailContainerSwitch = Switch(
    SwitchGroup.Journalism,
    "flagship-email-container",
    "Display the Flagship podcast container in the daily emails",
    owners = Seq(Owner.withName("journalism team")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false,
  )

  val FlagshipEmailContainerDynamicImageSwitch = Switch(
    SwitchGroup.Journalism,
    "flagship-email-container-dynamic-image",
    "For: Today in Focus podcast container. When On: Display a story image. Off: Use default album art image.",
    owners = Seq(Owner.withName("journalism team")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false,
  )

  val FlagshipFrontContainerSwitch = Switch(
    SwitchGroup.Journalism,
    "flagship-front-container",
    "Display the Flagship podcast container on the /uk front",
    owners = Seq(Owner.withName("journalism team")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false,
  )
}
