package views.support

object Basher {
    val bashersById = Map(
        "uk/environment" -> KeepItInTheGround
    )

    def fromId(id: String) = bashersById.get(id)
}

sealed trait Basher

case object KeepItInTheGround extends Basher