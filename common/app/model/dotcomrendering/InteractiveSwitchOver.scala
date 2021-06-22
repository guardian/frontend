package model.dotcomrendering

import org.joda.time.DateTime

object InteractiveSwitchOver {
  // Any interactives published after this date will be rendered on DCR instead of on frontend
  val date = DateTime.parse("2021-06-23T00:00Z")
}
