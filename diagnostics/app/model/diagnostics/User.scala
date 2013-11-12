package model.diagnostics

import com.google.common.util.concurrent.AtomicDouble

abstract class User {
  
  private lazy val metric = new AtomicDouble()

  def increment = {
    metric.addAndGet(1.0)
  }
  
  def count = { 
    metric.doubleValue match {
      case 0.0 => 0.01
      case _ => metric.doubleValue
    } 
  }

  def reset() {
    metric.set(0.0)
  }

}

object DesktopView extends User 
object DesktopSession extends User
object ResponsiveSession extends User
object ResponsiveView extends User

