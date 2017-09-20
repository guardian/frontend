package common

object StopWatch {
  def apply(): StopWatch = new StopWatch
}

class StopWatch {
  private val startTime = System.currentTimeMillis

  def elapsed: Long = System.currentTimeMillis - startTime

  override def toString(): String = s"${elapsed}ms"
}
