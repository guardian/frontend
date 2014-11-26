package contentapi

/** There's a concept of 'zones' in R2, which isn't current reflected in Content API. If you look at the 'sport' or
  * 'culture' section, you actually see an amalgamation of several other sections.
  */
object Zones {
  val ById = Map(
    "sport" -> Seq(
      "sport",
      "football"
    ),
    "culture" -> Seq(
      "culture",
      "film",
      "music",
      "books",
      "stage",
      "tv-and-radio",               // <-
      "artanddesign"                // <-  LOL WHAT
    )
  )

  def queryById(id: String) = {

    ById.get(id) map { sections =>

      
    }

  }
}
