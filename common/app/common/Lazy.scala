package common

import scala.language.implicitConversions

object Lazy {
  def apply[A](f: => A): Lazy[A] = new Lazy(f)
  implicit def conversionLazy[A](l: Lazy[A]): A = l.get()
}

class Lazy[A] private (f: => A) {
  private var option: Option[A] = None

  def get(): A =
    option match {
      case Some(a) => a
      case None    => val a = f; option = Some(a); a
    }

  def isDefined: Boolean = option.isDefined
}
