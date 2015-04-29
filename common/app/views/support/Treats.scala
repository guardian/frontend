package views.support

object Treat {
    def fromUrl(url: String) = {
        if (url.contains("/crosswords")) {
            CrosswordTreat
        } else if (url.contains("/politics/general-election-2015")) {
            RegisterToVoteTreat
        } else {
            NormalTreat
        }
    }
}

sealed trait Treat

case object CrosswordTreat extends Treat
case object RegisterToVoteTreat extends Treat
case object NormalTreat extends Treat

