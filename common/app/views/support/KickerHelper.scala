package views.support

import model.Trail

object KickerHelper {
  def label(trail: Trail) = trail.label.getOrElse(trail.visualTone) match {
    case "news" => "more"
    case s => s
  }
}