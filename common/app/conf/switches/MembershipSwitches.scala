package conf.switches

import conf.switches.SwitchGroup.Membership
import conf.switches.Expiry.never

trait MembershipSwitches {
  Switch(
    Membership,
    "prominent-membership-engagement-banner-uk",
    "Show more prominent membership engagement banner for the UK edition",
    owners = Seq(Owner.withGithub("justinpinner")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )
}
