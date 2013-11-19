package model.commercial.soulmates


object Fixtures {

  object Popular {
    val json =
      """
        |[
        |{"username":"rose29","gender":"Woman","age":59,"profile_photo":"https://members/a/small.png"},
        |{"username":"Hanabi","gender":"Man","age":57,"profile_photo":"https://members/b/small.png"},
        |{"username":"shelovessea","gender":"Woman","age":54,"profile_photo":"https://members/c/small.png"}
        |]
        | """.stripMargin

    val members = List(
      Member("rose29", "Woman", 59, "https://members/a/small.png"),
      Member("Hanabi", "Man", 57, "https://members/b/small.png"),
      Member("shelovessea", "Woman", 54, "https://members/c/small.png")
    )
  }

}
