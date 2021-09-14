package model

import scala.concurrent.Future

// Legacy content that couldn't be migrated to DCR because it contained an
// unsupported InteractiveBlockElement. Note, we expect to replace this with a
// tag-based approach in the near future so that CP/editorial can easily control
// things.
object PressedArticles {

  private[this] val articles = Set(
    "/sport/2015/jul/31/sports-quiz-week-ashes-chris-froome-arsenal-chelsea",
  )

  def isPressed(path: String): Boolean = articles.contains(path)
}
