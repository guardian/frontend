package model.diagnostics.viewability 

import common._
import conf._
import model.diagnostics.viewability._
import play.api.mvc.{ Content => _, _ }
import conf.Switches._

object Viewability extends Logging {

  def report(top: Option[Int], bottom: Option[Int], inline: Option[Int], mpu: Option[Int]) {
    
    if (AdDwellTimeLoggerSwitch.isSwitchedOn) {
      log.info(s"Top -> ${top}, Bottom -> ${bottom}, Inline -> ${inline}, Mpu -> ${mpu}")
    }

    top match {
      case Some(x:Int) =>
        Top.increment(x)
      case _ => {}
    }

    bottom match {
      case Some(x:Int) => {
        Bottom.increment(x)
      }
      case _ => {}
    }
    
    inline match {
      case Some(x:Int) =>
        Inline.increment(x)
      case _ => {}
    }
    
    mpu match {
      case Some(x:Int) =>
        MPU.increment(x)
      case _ => {}
    }

  }
}
