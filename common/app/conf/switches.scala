package conf

import com.gu.management.{ DefaultSwitch, Switchable }

object CommonSwitches {

  val FontSwitch = DefaultSwitch("font-loading", "Enables web font loading")

  val all: Seq[Switchable] = Seq(FontSwitch)

}
