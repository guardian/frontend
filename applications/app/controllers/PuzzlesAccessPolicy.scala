package controllers

import java.time.{LocalDate, ZoneId}

/** Decides which puzzles are free and which are premium.
  *
  * Puzzles from today back to [[FreeWindowDays]] days ago are free for everyone. Older ones ("premium puzzles") need a
  * Supporter Plus or Digital Pack subscription.
  *
  * The rule lives here, on the server, and never in the browser: a browser would use the reader's own clock, so
  * changing the computer's date would unlock every puzzle. "Today" is always the date in Europe/London, for every
  * reader, like the rest of the Puzzles code.
  */
object PuzzlesAccessPolicy {

  /** How many days back (counting today as day 0) a puzzle is still free. */
  val FreeWindowDays = 7

  private val London = ZoneId.of("Europe/London")

  def londonToday(): LocalDate = LocalDate.now(London)

  /** `true` when `puzzleDate` is older than the free window. Today's date and future dates are free. */
  def requiresSubscription(puzzleDate: LocalDate, today: LocalDate = londonToday()): Boolean =
    puzzleDate.isBefore(today.minusDays(FreeWindowDays.toLong))
}
