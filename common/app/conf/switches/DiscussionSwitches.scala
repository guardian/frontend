package conf.switches

import conf.switches.Expiry.never

trait DiscussionSwitches {
  val DiscussionAllPageSizeSwitch = Switch(
    SwitchGroup.Discussion,
    "discussion-all-page-size",
    "If this is switched on then users will have the option to load all comments",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

  val DiscussionAllowAnonymousRecommendsSwitch = Switch(
    SwitchGroup.Discussion,
    "discussion-allow-anonymous-recommends-switch",
    "if this is switched on, comments can be recommended by signed out users",
    owners = Seq(Owner.withGithub("NathanielBennett")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

  val DiscussionFetchExternalAssets = Switch(
    SwitchGroup.Discussion,
    "discussion-fetch-external-assets",
    "if this is switched on, discussion external assets map is fetched regularly",
    owners = Seq(Owner.withName("unknown")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false,
  )

  val RegisterWithPhoneNumber = Switch(
    SwitchGroup.Discussion,
    "register-with-phone",
    "When ON, new registering users will be required to provide a mobile number",
    owners = Seq(Owner.withGithub("NathanielBennett")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

  val EnableDiscussionSwitch = Switch(
    SwitchGroup.Discussion,
    "enable-discussion-switch",
    "When OFF, no requests will be possible from dotcom to DAPI and the comment UI will be removed",
    owners = Seq(Owner.withName("unknown")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
  )

}
