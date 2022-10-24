package conf.switches

import conf.switches.Expiry.never

trait FaciaSwitches {
  // Facia

  val FaciaToolDraftContent = Switch(
    SwitchGroup.Facia,
    "facia-tool-draft-content",
    "If this switch is on facia tool will offer draft content to editors, and press draft fronts from draft content",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false,
  )

  val FrontPressJobSwitch = Switch(
    SwitchGroup.Facia,
    "front-press-job-switch",
    "If this switch is on then the jobs to push and pull from SQS will run",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false,
  )

  val FrontPressJobSwitchStandardFrequency = Switch(
    SwitchGroup.Facia,
    "front-press-job-switch-standard-frequency",
    "If this switch is on then the jobs to push and pull from SQS will run",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false,
  )

  val FaciaPressOnDemand = Switch(
    SwitchGroup.Facia,
    "facia-press-on-demand",
    "If this is switched on, you can force facia to press on demand (Leave off)",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false,
  )

  val FaciaInlineEmbeds = Switch(
    SwitchGroup.Facia,
    "facia-inline-embeds",
    "If this is switched on, facia will prefetch embeds and render them on the server",
    owners = Seq(Owner.withName("unknown")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false,
  )

  val FaciaPressStatusNotifications = Switch(
    SwitchGroup.Facia,
    "facia-press-status-notifications",
    "If this is switched off, facia press will not send status notification on kinesis",
    owners = Seq(Owner.withName("unknown")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false,
  )

}
