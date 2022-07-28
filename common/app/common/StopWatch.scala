package common

import java.util.concurrent.TimeUnit

object StopWatch {
  def apply(): StopWatch = new StopWatch
}

class StopWatch {
  private val startTime = System.nanoTime

  def elapsed: Long = TimeUnit.NANOSECONDS.toMillis(System.nanoTime - startTime)

  override def toString(): String = s"${elapsed}ms"
}
