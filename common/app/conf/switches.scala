package conf

import com.gu.management.{ DefaultSwitch, Switchable }

object CommonSwitches {

  val all: Seq[Switchable] = Seq(DefaultSwitch("font-loading", "Enables web font loading"))

}
