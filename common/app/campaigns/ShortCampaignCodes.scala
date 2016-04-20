package campaigns

object ShortCampaignCodes {

  private val campaigns = Map (
    "iw" -> "twt_ipd",
    "wc" -> "twt_wc",
    "tf" -> "twt_fd",
    "fb" -> "fb_gu",
    "fo" -> "fb_ot",
    "us" -> "fb_us",
    "au" -> "soc_567",
    "tw" -> "twt_gu",
    "at" -> "twt_atn",
    "sfb"-> "share_btn_fb",
    "ip" -> "twt_iph",
    "stw" -> "share_btn_tw",
    "swa" -> "share_btn_wa",
    "em"  -> "email",
    "sgp" -> "share_btn_gp",
    "sbl" -> "share_btn_link"
  )

  // Resolves "stw" to query param: CMP->share_btn_tw
  def makeQueryParameter(shortCode: String): Map[String, Seq[String]] = {
    campaigns.get(shortCode).map { fullCampaign =>
      Map(("CMP", Seq(fullCampaign)))
    } getOrElse Map.empty
  }

  def getFullCampaign(shortCode: String): Option[String] = campaigns.get(shortCode)
}