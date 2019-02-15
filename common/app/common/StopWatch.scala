package common

object StopWatch {
  def apply(): StopWatch = new StopWatch
}

class StopWatch {
  private val startTime = System.nanoTime

  def elapsed: Long = System.nanoTime - startTime

  override def toString(): String = s"${elapsed}ms"
}
