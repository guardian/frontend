package conf.switches

import conf.switches.Expiry.never

trait JournalismSwitches {
  val AtomRendererSwitch: Switch = Switch(
    SwitchGroup.Journalism,
    "atom-renderer",
    "Renders atoms using the atom rendering library",
    owners = Seq(Owner.withName("journalism team")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false,
  )

  val RenderInArticleAudioAtomSwitch: Switch = Switch(
    SwitchGroup.Journalism,
    "render-in-article-audio-atoms",
    "controls whether in-article audio atoms are displayed",
    owners = Seq(Owner.withName("journalism team")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false,
  )

  val AudioOnwardJourneySwitch: Switch = Switch(
    SwitchGroup.Journalism,
    "audio-onward-journey-switch",
    "Display latest podcast episodes on audio pages",
    owners = Seq(Owner.withName("journalism team")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

  val FlagshipEmailContainerSwitch: Switch = Switch(
    SwitchGroup.Journalism,
    "flagship-email-container",
    "Display the Flagship podcast container in the daily emails",
    owners = Seq(Owner.withName("journalism team")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false,
  )

  val FlagshipEmailContainerDynamicImageSwitch: Switch = Switch(
    SwitchGroup.Journalism,
    "flagship-email-container-dynamic-image",
    "For: Today in Focus podcast container. When On: Display a story image. Off: Use default album art image.",
    owners = Seq(Owner.withName("journalism team")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false,
  )

  val FlagshipFrontContainerSwitch: Switch = Switch(
    SwitchGroup.Journalism,
    "flagship-front-container",
    "Display the Flagship podcast container on the /uk front",
    owners = Seq(Owner.withName("journalism team")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false,
  )
}
