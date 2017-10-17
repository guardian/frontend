package conf.switches

import conf.switches.Expiry.never

trait JournalismSwitches {

  val AtomRenderer = Switch(
    SwitchGroup.Journalism,
    "use-atom-renderer-library",
    "Use the atom-renderer library.",
    owners = Seq(Owner.withGithub("regiskuckaertz")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )
}
