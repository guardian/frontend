package dfp

import java.lang.reflect.{Field, Modifier}

/*
  Badly behaved MapMaker class in com.google.inject:guice:3.0 blocks finalizer thread.

  http://stackoverflow.com/questions/8842256/guice-3-0-tomcat-7-0-classloader-memory-leak
 */
object MemoryLeakPlug {

  def apply() {
    val queueHolderClass = Class.forName("com.google.inject.internal.util.$MapMaker$QueueHolder")
    val queueField = queueHolderClass.getDeclaredField("queue")
    queueField.setAccessible(true)
    val modifiersField = classOf[Field].getDeclaredField("modifiers")
    modifiersField.setAccessible(true)
    modifiersField.setInt(queueField, queueField.getModifiers & ~Modifier.FINAL)
    queueField.set(null, null)
  }
}
