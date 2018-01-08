package views.support.fragment

import play.twirl.api.Html

case class ConsentStep (
  name: String,
  title: String,
  help: List[String] = List(),
  content: Html = Html(""),
  show: Boolean = true,
)
