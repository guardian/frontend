package conf.switches

import conf.switches.Expiry.never
import java.time.LocalDate

trait JournalismSwitches {

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

  val Lightbox = Switch(
    SwitchGroup.Journalism,
    name = "lightbox",
    description = "Enable lightbox for images",
    owners = Seq(Owner.withEmail("dotcom.platform@theguardian.com")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
  )

  val AbsoluteServerTimes = Switch(
    SwitchGroup.Journalism,
    name = "absolute-server-times",
    description = "Force times on the server to be absolute to improve caching",
    owners = Seq(Owner.withEmail("dotcom.platform@theguardian.com")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

  val Euro2024Header = Switch(
    SwitchGroup.Journalism,
    name = "euro-2024-header",
    description = "Show the Euro 2024 interactive atom header on football pages",
    owners = Seq(Owner.withEmail("dotcom.platform@theguardian.com")),
    safeState = Off,
    sellByDate = LocalDate.of(2024, 7, 15),
    exposeClientSide = true,
  )
}
