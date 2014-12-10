package dfp

import java.lang.reflect.{Field, Modifier}

import common.Logging

/*
  Badly behaved MapMaker class in com.google.inject:guice:3.0 blocks finalizer thread.

  http://stackoverflow.com/questions/8842256/guice-3-0-tomcat-7-0-classloader-memory-leak
 */
object MemoryLeakPlug extends Logging {

  def apply(): Unit = {
    log.info("Plugging memory leak")
    try {
      val queueHolderClass = Class.forName("com.google.inject.internal.util.$MapMaker$QueueHolder")
      val queueField = queueHolderClass.getDeclaredField("queue")
      queueField.setAccessible(true)
      val modifiersField = classOf[Field].getDeclaredField("modifiers")
      modifiersField.setAccessible(true)
      modifiersField.setInt(queueField, queueField.getModifiers & ~Modifier.FINAL)
      queueField.set(null, null)
      log.info("Memory leak plugged")
    } catch {
      case e: Exception => log.error(e.getMessage)
    }
  }
}
