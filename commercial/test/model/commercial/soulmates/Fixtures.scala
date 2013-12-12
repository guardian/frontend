package model.commercial.soulmates


object Fixtures {

  object Popular {
    val json =
      """
        |[
        |{"username":"rose29","gender":"Woman","age":59,"profile_photo":"https://members/a/small.png","location": "St. Johns Wood, London, Greater London, England, United Kingdom"},
        |{"username":"Hanabi","gender":"Man","age":57,"profile_photo":"https://members/b/small.png","location": "Guildford, Surrey, England, United Kingdom"},
        |{"username":"shelovessea","gender":"Woman","age":54,"profile_photo":"https://members/c/small.png","location": "England, United Kingdom"}
        |]
        | """.stripMargin

    val members = List(
      Member("rose29", Woman, 59, "https://members/a/small.png", "St. Johns Wood"),
      Member("Hanabi", Man, 57, "https://members/b/small.png", "Guildford"),
      Member("shelovessea", Woman, 54, "https://members/c/small.png", "England")
    )
  }

}
