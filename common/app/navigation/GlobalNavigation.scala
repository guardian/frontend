package navigation

object GlobalNavigation {

  val newsPillar = Pillar(
    "network front",
    "/",
    "news",
    "headlines",
    NewsSections
  )

  val opinionPillar = Pillar(
    "commentisfree",
    "/commentisfree",
    "opinion",
    "opinion home",
    OpinionSections
  )

  val sportPillar = Pillar(
    "sport",
    "/sport",
    "sport",
    "sport home",
    SportSections
  )

  val artsPillar = Pillar(
    "culture",
    "/culture",
    "arts",
    "culture home",
    ArtsSections
  )

  val lifePillar = Pillar(
    "lifeandstyle",
    "/lifeandstyle",
    "life",
    "lifestyle home",
    LifeSections
  )

  val pillars = List(newsPillar, opinionPillar, sportPillar, artsPillar, lifePillar)
}
