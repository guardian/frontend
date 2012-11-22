package common

import com.gu.openplatform.contentapi.ApiError
import play.api.Logger

object `package` {

  implicit def string2ToOptions(s: String) = new {
    lazy val toIntOption: Option[Int] = try {
      Some(s.toInt)
    } catch {
      case _ => None
    }

    lazy val toBooleanOption: Option[Boolean] = try {
      Some(s.toBoolean)
    } catch {
      case _ => None
    }
  }

  implicit def string2Dequote(s: String) = new {
    lazy val dequote = s.replace("\"", "")
  }

  def suppressApi404[T](block: => Option[T])(implicit log: Logger): Option[T] = {
    try {
      block
    } catch {
      case ApiError(404, message) =>
        log.info("Got a 404 while calling content api: " + message)
        None
    }
  }

  def quietly(block: => Unit)(implicit log: Logger) = try {
    block
  } catch {
    case e => log.error("Failing quietly on: " + e.getMessage, e)
  }

  def quietlyWithDefault[A](default: A)(block: => A)(implicit log: Logger) = try {
    block
  } catch {
    case e =>
      log.error("Failing quietly on: " + e.getMessage, e)
      default
  }
}

object Reference {
  def apply(s: String) = {
    val parts = s.split("/")
    parts(0) -> parts(1)
  }
}

trait Implicits {

  // thanks https://gist.github.com/1189097
  implicit def seq2Distinct[T, C[T] <: Seq[T]](tees: C[T]) = new {
    import collection.generic.CanBuildFrom
    import collection.mutable.{ HashSet => MutableHashSet }

    def distinctBy[S](hash: T => S)(implicit cbf: CanBuildFrom[C[T], T, C[T]]): C[T] = {
      val builder = cbf()
      val seen = MutableHashSet[S]()

      for (t <- tees) {
        if (!seen(hash(t))) {
          builder += t
          seen += hash(t)
        }
      }

      builder.result
    }
  }
}
