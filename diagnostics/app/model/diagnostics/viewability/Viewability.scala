package model.diagnostics.viewability 

import common._
import conf._
import model.diagnostics.viewability._
import play.api.mvc.{ Content => _, _ }
import conf.Switches._

object Viewability extends Logging {

  def report(top: Option[Int], bottom: Option[Int], inline: Option[Int], mpu: Option[Int], view: Option[Int], layout: Option[String]) {
    
    if (AdDwellTimeLoggerSwitch.isSwitchedOn) {
      log.info(s"Top -> ${top}, Bottom -> ${bottom}, Inline -> ${inline}, Mpu -> ${mpu}, Views -> ${view}, Layout -> ${layout}")
    }

    top.foreach(Top.increment(_))
    bottom.foreach(Bottom.increment(_))
    mpu.foreach(MPU.increment(_))
    inline.foreach(Inline.increment(_))
    view.foreach(firstView.increment(_))

  }
}
