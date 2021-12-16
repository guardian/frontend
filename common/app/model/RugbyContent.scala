package model

import java.time.format.DateTimeFormatter
import java.time.ZoneId

object RugbyContent {

  val timeFormatter: DateTimeFormatter = DateTimeFormatter.ofPattern("YYYY/MM/dd")
  timeFormatter.withZone(ZoneId.of("UTC"))

  val teamNameIds = Map(
    ("sport/japanrugby", "73710"),
    ("sport/russia-rugby-union-team", "204077"),
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
    ("sport/canadarugby", "73753"),
    ("sport/usarugby", "73733"),
  )
}
