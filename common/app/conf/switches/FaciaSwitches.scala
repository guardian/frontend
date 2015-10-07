package conf.switches

import conf.switches.Expiry.never
import org.joda.time.LocalDate

trait FaciaSwitches {
  // Facia

  val ToolDisable = Switch(
    "Facia",
    "facia-tool-disable",
    "If this is switched on then the fronts tool is disabled",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val ToolSparklines = Switch(
    "Facia",
    "facia-tool-sparklines",
    "If this is switched on then the fronts tool renders images from sparklines.ophan.co.uk",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val FaciaToolPressSwitch = Switch(
    "Facia",
    "facia-tool-press-front",
    "If this switch is on facia tool will press fronts on each change",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val FaciaToolDraftContent = Switch(
    "Facia",
    "facia-tool-draft-content",
    "If this switch is on facia tool will offer draft content to editors, and press draft fronts from draft content",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val FaciaToolCachedContentApiSwitch = Switch(
    "Facia",
    "facia-tool-cached-capi-requests",
    "If this switch is on facia tool will cache responses from the content API and use them on failure",
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

  val FaciaToolAllowConfigForAll = Switch(
    "Facia",
    "facia-tool-allow-config-for-all",
    "If this is switched on, anyone can access the config tool, regardless of permissions service (Leave off)",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

}
