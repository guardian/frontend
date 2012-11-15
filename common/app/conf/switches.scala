package conf

import com.gu.management.{ DefaultSwitch, Switchable }

object CommonSwitches {

  val FontSwitch = DefaultSwitch("font-family", "Enables web font loading")

  val PollingSwitch = DefaultSwitch("polling", "Turn off to disable polling across site", initiallyOn = true)

  val AudienceScienceSwitch = DefaultSwitch("audience-science", "Disables Audience Science tracking")

  val all: Seq[Switchable] = Seq(FontSwitch, PollingSwitch, AudienceScienceSwitch)

}
