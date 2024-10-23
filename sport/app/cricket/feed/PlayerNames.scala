package cricket.feed

import cricketModel.Player

object PlayerNames {

  def uniqueNames(players: List[Player]) = (for {
    playersGroupedByName <- players.groupBy(_.lastName).values
    player <- playersGroupedByName
  } yield {
    player.id -> { if (playersGroupedByName.size > 1) s"${player.firstName} ${player.lastName}" else player.lastName }
  }).toMap
}
