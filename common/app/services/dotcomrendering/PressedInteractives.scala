package services.dotcomrendering

object PressedInteractives {
  // Temporarily retain a list of pressed interactives that Visuals agree to show to readers
  // Ed Tools are supporting us in how to batch/programmatically add tags to pressed articles.
  // When we can tag pressed articles (tracking/dcroptout) then we will:
  // - tag all articles that appear in this list
  // - remove this file entirely
  // - update the InteractiveController to show pressed pages based on presence of the tag
  // - update the press+clean functionality to automate tagging as part of this process
  private[this] val interactives = Set(
    "world/ng-interactive/2020/apr/08/coronavirus-100-days-that-changed-the-world",
  )

  def isPressed(path: String): Boolean = interactives.contains(path)
}
