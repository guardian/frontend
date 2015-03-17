package model

package object commercial {
  object OptString {
    def apply(s: String): Option[String] = Option(s) filter (_.trim.nonEmpty)
  }
}
