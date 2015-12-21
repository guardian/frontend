package views.support

object Basher {
    def fromId(id: String) = {
        if (id == "environment/series/keep-it-in-the-ground") {
            KeepItInTheGround
        } else {
            None
        }
    }
}

sealed trait Basher

case object KeepItInTheGround extends Basher