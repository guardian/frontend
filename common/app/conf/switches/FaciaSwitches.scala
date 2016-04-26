package conf.switches

import conf.switches.Expiry.never
import org.joda.time.LocalDate

trait FaciaSwitches {
  // Facia

  val FaciaToolDraftContent = Switch(
    SwitchGroup.Facia,
    "facia-tool-draft-content",
    "If this switch is on facia tool will offer draft content to editors, and press draft fronts from draft content",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val FrontPressJobSwitch = Switch(
    SwitchGroup.Facia,
    "front-press-job-switch",
    "If this switch is on then the jobs to push and pull from SQS will run",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val FrontPressJobSwitchStandardFrequency = Switch(
    SwitchGroup.Facia,
    "front-press-job-switch-standard-frequency",
    "If this switch is on then the jobs to push and pull from SQS will run",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val FaciaPressOnDemand = Switch(
    SwitchGroup.Facia,
    "facia-press-on-demand",
    "If this is switched on, you can force facia to press on demand (Leave off)",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val FaciaInlineEmbeds = Switch(
    SwitchGroup.Facia,
    "facia-inline-embeds",
    "If this is switched on, facia will prefetch embeds and render them on the server",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val FaciaPressStatusNotifications = Switch(
    SwitchGroup.Facia,
    "facia-press-status-notifications",
    "If this is switched off, facia press will not send status notification on kinesis",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val FaciaPressCrossAccountStorage = Switch(
    SwitchGroup.Facia,
    "facia-press-cross-account-storage",
    "If this is switched on, facia press will access the bucket in cmsFronts account",
    safeState = Off,
    sellByDate = new LocalDate(2016, 6, 21),
    exposeClientSide = false
  )

}
