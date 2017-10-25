package com.gu.contentatom.renderer
package utils

import scala.io.Source

object LoadFromClasspath {
  def apply(path: String): Option[String] =
    Option(getClass.getResourceAsStream(path))
      .map(is => Source.fromInputStream(is).mkString)
}