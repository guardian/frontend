package views.support

object Basher {
    def fromId(id: String) = {
        if (id == "uk/environment") {
            KeepItInTheGround
        } else {
            None
        }
    }
}

sealed trait Basher

case object KeepItInTheGround extends Basher