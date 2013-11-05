package model.diagnostics

import common.Logging
import java.util.concurrent.ConcurrentHashMap
import com.google.common.util.concurrent.AtomicDouble

class User {
  
  private lazy val metric = new AtomicDouble()

  def increment = {
    metric.addAndGet(1.0)
  }
  
  def count = { 
    metric.get
  }

  def reset() {}

}

object View extends User with Logging {} 
object Session extends User with Logging {}

