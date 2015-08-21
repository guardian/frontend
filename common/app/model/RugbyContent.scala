package model

import org.joda.time.format.{DateTimeFormat, DateTimeFormatter}

object RugbyContent {

  val timeFormatter: DateTimeFormatter = {
    DateTimeFormat.forPattern("YYYY/MM/dd")
  }
  val teamNameIds = Map (
    ("sport/australia-rugby-union-team", "100"),
    ("sport/new-zealand-rugby-union-team", "850"),
    ("sport/italy-rugby-union-team", "952"),
    ("sport/scotland-rugby-union-team", "700"),
    ("sport/france-rugby-union-team", "650"),
    ("sport/england-rugby-union-team", "550")
  )
}
