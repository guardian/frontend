package common

import play.api.libs.json.{Json, Reads}

trait ResourcesHelper {
  def slurp(path: String): Option[String] =
    Option(getClass.getClassLoader.getResource(path)).map(scala.io.Source.fromURL(_).mkString)

  def slurpOrDie(path: String): String =
    slurp(path) getOrElse {
      throw new RuntimeException(s"Required resource $path does not exist")
    }

  def slurpJsonOrDie[A: Reads](path: String) =
    Json.fromJson[A](Json.parse(slurpOrDie(path))) getOrElse {
      throw new RuntimeException(s"Could not deserialize JSON at $path")
    }
}
