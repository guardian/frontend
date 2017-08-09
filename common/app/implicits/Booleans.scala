package implicits

object Booleans extends Booleans

trait Booleans {
  implicit class RichBoolean(b: Boolean) {
    def toOption[A](value: => A): Option[A] = if (b) Some(value) else None
  }
}
