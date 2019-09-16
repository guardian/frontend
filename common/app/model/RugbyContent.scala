package model

import org.joda.time.format.{DateTimeFormat, DateTimeFormatter}

object RugbyContent {

  val timeFormatter: DateTimeFormatter = {
    DateTimeFormat.forPattern("YYYY/MM/dd")
  }
//  val teamNameIds = Map (
//    ("sport/australia-rugby-union-team", "100"),
//    ("sport/wales-rugby-union-team", "500"),
//    ("sport/england-rugby-union-team", "550"),
//    ("sport/ireland-rugby-union-team", "600"),
//    ("sport/france-rugby-union-team", "650"),
//    ("sport/scotland-rugby-union-team", "700"),
//    ("sport/tonga-rugby-union-team", "750"),
//    ("sport/argentina-rugby-union-team", "800"),
//    ("sport/new-zealand-rugby-union-team", "850"),
//    ("sport/south-africa-rugby-team", "900"),
//    ("sport/samoa-rugby-union-team", "950"),
//    ("sport/romaniarugbyunionteam", "951"),
//    ("sport/italy-rugby-union-team", "952"),
//    ("sport/canadarugby", "953"),
//    ("sport/fiji-rugby-union-team", "954"),
//    ("sport/uruguay-rugby-union-team", "2800"),
//    ("sport/georgia-rugby-union-team", "2850"),
//    ("sport/namibia-rugby-union-team", "2900"),
//    ("sport/usarugby", "2950"),
//    ("sport/japanrugby", "3000")
//  )

//  2015/09/20/73734/73753 -> Ireland v Canada 2015-09-20T01:30:00.000+10:00
//  2015/09/24/73752/73735 -> Australia v Fiji 2015-09-24T03:45:00.000+10:00
//  2015/09/27/73730/73711 -> South Africa v Samoa 2015-09-27T03:45:00.000+10:00
//  2015/09/19/73738/73735 -> England v Fiji 2015-09-19T07:00:00.000+10:00
//  2015/09/19/73754/73736 -> Tonga v Georgia 2015-09-19T23:00:00.000+10:00
//  2015/09/28/73734/73742 -> Ireland v Romania 2015-09-28T03:45:00.000+10:00
//  2015/09/27/73738/73740 -> England v Wales 2015-09-27T07:00:00.000+10:00
//  2015/09/21/73739/73751 -> New Zealand v Argentina 2015-09-21T03:45:00.000+10:00
//  2015/09/20/73730/73710 -> South Africa v Japan 2015-09-20T03:45:00.000+10:00
//  2015/09/30/73754/73741 -> Tonga v Namibia 2015-09-30T03:45:00.000+10:00
//  2015/09/24/73743/73742 -> France v Romania 2015-09-24T07:00:00.000+10:0
//  2015/09/20/73711/73733 -> Samoa v USA 2015-09-20T23:00:00.000+10:00
//  2015/09/27/73752/73737 -> Australia v Uruguay 2015-09-27T23:00:00.000+10:00
//  2015/09/20/73743/73750 -> France v Italy 2015-09-20T07:00:00.000+10:00
//  2015/09/26/73751/73736 -> Argentina v Georgia 2015-09-26T03:45:00.000+10:00
//  2015/09/25/73739/73741 -> New Zealand v Namibia 2015-09-25T07:00:00.000+10:00
//  2015/09/28/73732/73733 -> Scotland v USA 2015-09-28T01:30:00.000+10:00
//  2015/09/21/73740/73737 -> Wales v Uruguay 2015-09-21T01:30:00.000+10:00
//  2015/09/27/73750/73753 -> Italy v Canada 2015-09-27T01:30:00.000+10:00
//  2015/09/24/73732/73710 -> Scotland v Japan 2015-09-24T01:30:00.000+10:00

  val teamNameIds = Map (
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
