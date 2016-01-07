package views.support

object Basher {
    val bashersById = Map(
        "environment/series/keep-it-in-the-ground" -> KeepItInTheGround,
        "society/series/this-is-the-nhs" -> ThisIsTheNHS
    )

    def fromId(id: String) = bashersById.get(id)
}

sealed trait Basher

case object KeepItInTheGround extends Basher
case object ThisIsTheNHS extends Basher
