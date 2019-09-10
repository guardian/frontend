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

  val paTeamNameIds = Map (
    ("sport/japanrugby", "73710"),
    ("sport/russiarugby", "204077"), // TEST as new
    ("sport/australia-rugby-union-team", "73752"),
    ("sport/fiji-rugby-union-team", "73735"),
    ("sport/france-rugby-union-team", "73743"),
    ("sport/argentina-rugby-union-team", "73751"),
    ("sport/new-zealand-rugby-union-team", "73739"),
    ("sport/south-africa-rugby-team", "73730"),
    ("sport/italy-rugby-union-team", "73750"),
    ("sport/namibia-rugby-union-team", "73741"),
    ("sport/ireland-rugby-union-team", "73734"),
    ("sport/scotland-rugby-union-team", "73732"),
    ("sport/england-rugby-union-team", "73738"),
    ("sport/tonga-rugby-union-team", "73754"),
    ("sport/wales-rugby-union-team", "73740"),
    ("sport/georgia-rugby-union-team", "73736"),
    ("sport/romaniarugbyunionteam", "73742"),
    ("sport/samoa-rugby-union-team", "73711"),
    ("sport/uruguay-rugby-union-team", "73737"),
    ("sport/canadarugby", "73753")
  )
}
