package views

import pa.{ LineUpPlayer, Team }
import common.Logging
import play.twirl.api.Html

object ShortName {

  val names = Map("44" -> "Wolves")

  def apply(team: Team): String = names.getOrElse(team.id, team.name)

}

object MatchStatus extends Logging {

  // This is the list of possible statuses from the docs
  // http://pads6.pa-sport.com/API/Football/Documents/Football%20API%20Programmers%20Usage%20Guide%20V1.5.pdf

  private val statuses = Map(

    ("KO", "1st"), // The Match has started (Kicked Off).

    ("HT", "HT"), // The Referee has blown the whistle for Half Time.

    ("SHS", "2nd"), // The Second Half of the Match has Started.

    ("FT", "FT"), // The Referee has blown the whistle for Full Time.
    ("PTFT", "FT"), // Penalty ShooT Full Time.
    ("Result", "FT"), // The Result is official.
    ("ETFT", "FT"), // Extra Time, Full Time has been blown.
    ("MC", "FT"), // Match has been Completed.

    ("FTET", "ET"), // Full Time, Extra Time it to be played.
    ("ETS", "ET"), // Extra Time has Started.
    ("ETHT", "ET"), // Extra Time Half Time has been called.
    ("ETSHS", "ET"), // Extra Time, Second Half has Started.

    ("FTPT", "PT"), // Full Time, Penalties are To be played.
    ("PT", "PT"), // Penalty ShooT Out has started.
    ("ETFTPT", "PT"), // Extra Time, Full Time, Penalties are To be played.

    ("Suspended", "S"), // Match has been Suspended.

    // don't really expect to see these (the way we handle data)
    ("Resumed", "R"), // Match has been Resumed.
    ("Abandoned", "A"), // Match has been Abandoned.
    ("Fixture", "F"), // Created Fixture is available and had been Created by us.
    ("-", "F"), // this sneaky one is not in the docs
    ("New", "N"), // Match A New Match has been added to our data.
    ("Cancelled", "C") // A Match has been Cancelled.
  )
  // if we get a status we do not expect just take the first 2 letters
  def apply(status: String): Html = Html(statuses.getOrElse(status, {
    log.info(s"unknown match status $status")
    status.take(2)
  }))

}

object NudgePercent {
  // the realities of padding and margins means we never actually want 100%
  def apply(main: Int, other: Int): Int = {
    if (main == 0 && other == 0) 50
    else if (main >= 88) 88
    else if (main < 12) 12
    else main
  }
}

object PercentMaker {
  // I want the percentages to add up to 100
  def apply(home: Int, away: Int): (Int, Int) = {
    val homeD = home.toDouble
    val totalD = (home + away).toDouble
    if (home + away == 100) (home, away)
    else if (home == 0 && away == 0) (50, 50)
    else ((homeD / totalD * 100).toInt, 100 - (homeD / totalD * 100).toInt)
  }
}
