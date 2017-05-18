package views.support

object Treat {
    def fromUrl(url: String): Treat = {
        if (url.contains("/crosswords")) {
            CrosswordTreat
        } else if (url.contains("/politics/general-election-2015")) {
            SnappableTreat
        } else if (url.contains("/climate-publishers-network")) {
            ClimateTreat
        } else if (url.contains("/music/glastonbury-2015")) {
            GlastoTreat
        } else {
            NormalTreat
        }
    }
}

sealed trait Treat

case object CrosswordTreat extends Treat
case object SnappableTreat extends Treat
case object ClimateTreat extends Treat
case object GlastoTreat extends Treat
case object NormalTreat extends Treat
