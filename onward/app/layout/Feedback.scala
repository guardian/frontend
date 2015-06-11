package layout

case class Feedback(problem: String, email: Boolean = false, links: Option[Seq[(String, String)]] = None)

object Feedback {

  val thanks = "Thanks for letting us know that"
  val monitor = "Your feedback helps us understand which areas of the site need attention."

  def apply(path: String): Feedback = path match {
    case "" => Feedback(
      "We're sorry that you're having trouble with our web site.",
      false,
      Some(Seq("crashing" -> "My browser is crashing or reloading",
        "discussion" -> "I'm having trouble either reading or making comments",
        "performance" -> "The site is too slow on my device",
        "other" -> "I have a technical issue but it doesn't fit into any of the above categories")))
    case "crashing" => Feedback(s"$thanks you've experienced an issue with your browser crashing or reloading. $monitor", true)
    case "discussion" => Feedback(s"$thanks you're having trouble reading or making comments. $monitor", true)
    case "performance" => Feedback(s"$thanks the site is too slow on your device. $monitor", true)
    case "other" => Feedback(s"$thanks you're having an issue with our web site.", true)
    case _ => Feedback("We're sorry that you're having trouble with our web site.", false)
  }

}
