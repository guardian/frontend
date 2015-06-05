package layout

case class Feedback(problem: String, email: Boolean = false, links: Option[Seq[(String, String)]] = None)

object Feedback {

  val thanks = "Thanks for letting us know that"
  val monitor = "We monitor the total number of reports so we know which areas you would like to see improved."

  def apply(path: String): Feedback = path match {
    case "" => Feedback(
      "We're sorry that you're having trouble with our web site.",
      false,
      Some(Seq("crashing" -> "My browser is crashing or reloading",
        "nextgen" -> "I haven't got used to the site redesign",
        "content" -> "I want to contact someone about some content or general matters",
        "other" -> "I'm having another technical issue accessing or using your site")))
    case "crashing/" => Feedback(s"$thanks you've experienced an issue with your browser crashing. $monitor", true)
    case "nextgen/" => Feedback(s"$thanks you don't feel comfortable with our new site.", true)
    case "content/" => Feedback("We're sorry that you have a problem with some of our content.", false)
    case "other/" => Feedback(s"$thanks you're having an issue with our web site.", true)
    case _ => Feedback("We're sorry that you're having trouble with our web site.", false)
  }

}
