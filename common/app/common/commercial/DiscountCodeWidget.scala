package common.commercial

case class DiscountCodeMerchantLink(
  title: String,
  url: String,
)

object DiscountCodeLinks{
  val asos = DiscountCodeMerchantLink("ASOS", "https://discountcode.theguardian.com/uk/asos")
  val NowTV = DiscountCodeMerchantLink("Now-TV", "https://discountcode.theguardian.com/uk/sky-now-tv")

  val links = List(
  asos,
  NowTV
  )
}

