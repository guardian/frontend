package model

import org.joda.time.format.{DateTimeFormat, DateTimeFormatter}

object RugbyContent {

  val timeFormatter: DateTimeFormatter = {
    DateTimeFormat.forPattern("YYYY/MM/dd")
  }
  val teamNameIds = Map (
    ("sport/australia-rugby-union-team", "100"),
    ("sport/wales-rugby-union-team", "500"),
    ("sport/england-rugby-union-team", "550"),
    ("sport/ireland-rugby-union-team", "600"),
    ("sport/france-rugby-union-team", "650"),
    ("sport/scotland-rugby-union-team", "700"),
    ("sport/tonga-rugby-union-team", "750"),
    ("sport/argentina-rugby-union-team", "800"),
    ("sport/new-zealand-rugby-union-team", "850"),
    ("sport/south-africa-rugby-team", "900"),
    ("sport/samoa-rugby-union-team", "950"),
    ("sport/romaniarugbyunionteam", "951"),
    ("sport/italy-rugby-union-team", "952"),
    ("sport/canadarugby", "953"),
    ("sport/fiji-rugby-union-team", "954"),
    ("sport/uruguay-rugby-union-team", "2800"),
    ("sport/georgia-rugby-union-team", "2850"),
    ("sport/namibia-rugby-union-team", "2900"),
    ("sport/usarugby", "2950"),
    ("sport/japanrugby", "3000")
  )
}
