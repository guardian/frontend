package model.dotcomrendering

import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

object InteractiveSwitchOver {
  // Any interactives published after this date will be rendered on DCR instead of on frontend
  val date: LocalDateTime = LocalDateTime.parse("2021-06-23T00:00:00Z", DateTimeFormatter.ISO_DATE_TIME)
}
