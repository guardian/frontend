package football.formats

object PaPlayer {
  def position(position: String): String =
    position match {
      case "Goal Keeper" => "Goalkeeper"
      case _             => position
    }
}
