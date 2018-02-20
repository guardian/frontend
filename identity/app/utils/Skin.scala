package utils

object Skin {

  sealed trait Skin {
    val className: String
    def getCssClass(base: String): String = s"$base--$className"
  }

  case object DefaultSkin extends Skin {
    override val className = ""
    override def getCssClass(base: String): String = ""
  }

  case object GdprOptinCampaignSkin extends Skin {
    override val className = "gdpr-oi-campaign"
  }


}
