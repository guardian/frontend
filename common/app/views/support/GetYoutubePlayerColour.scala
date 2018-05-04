package views.support

import model.Pillar.RichPillar

object GetYoutubePlayerColour {
  def forPillar(pillar: RichPillar): String = {
    // Change the colour of the control bar in the YouTube player
    // Text is always white; don't theme `special-report` as the contrast isn't high enough
    pillar.nameOrDefault.toLowerCase match {
      case "news"           => "#c70000"
      case "opinion"        => "#e05e00"
      case "sport"          => "#0084c6"
      case "culture"        => "#a1845c"
      case "lifestyle"      => "#bb3b80"
      // case "special-report" => "#ffe500"
      case _                => "#c70000"
    }
  }
}
