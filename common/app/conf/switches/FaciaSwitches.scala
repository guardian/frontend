package conf.switches

import conf.switches.Expiry.never
import org.joda.time.LocalDate

trait FaciaSwitches {
  // Facia

  val FaciaToolDraftContent = Switch(
    "Facia",
    "facia-tool-draft-content",
    "If this switch is on facia tool will offer draft content to editors, and press draft fronts from draft content",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val FrontPressJobSwitch = Switch(
    "Facia",
    "front-press-job-switch",
    "If this switch is on then the jobs to push and pull from SQS will run",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val FrontPressJobSwitchStandardFrequency = Switch(
    "Facia",
    "front-press-job-switch-standard-frequency",
    "If this switch is on then the jobs to push and pull from SQS will run",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val FaciaPressOnDemand = Switch(
    "Facia",
    "facia-press-on-demand",
    "If this is switched on, you can force facia to press on demand (Leave off)",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val FaciaInlineEmbeds = Switch(
    "Facia",
    "facia-inline-embeds",
    "If this is switched on, facia will prefetch embeds and render them on the server",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

}
