package common.commercial

case class DiscountCodeMerchantLink(
  title: String,
  url: String,
)

object DiscountCodeLinks {
  val Deliveroo = DiscountCodeMerchantLink("Now-TV", "https://discountcode.theguardian.com/uk/deliveroo")
  val Travelodge = DiscountCodeMerchantLink("Travelodge", "https://discountcode.theguardian.com/uk/travelodge")
  val FunkyPigeon = DiscountCodeMerchantLink("Funky Pigeon", "https://discountcode.theguardian.com/uk/funky-pigeon")
  val Wayfair = DiscountCodeMerchantLink("Wayfair", "https://discountcode.theguardian.com/uk/wayfair")
  val Groupon = DiscountCodeMerchantLink("Groupon", "https://discountcode.theguardian.com/uk/groupon")
  val TUI = DiscountCodeMerchantLink("TUI", "https://discountcode.theguardian.com/uk/tui")
  val Very = DiscountCodeMerchantLink("Very", "https://discountcode.theguardian.com/uk/very")
  val RiverIsland = DiscountCodeMerchantLink("River Island", "https://discountcode.theguardian.com/uk/river-island")
  val Argos = DiscountCodeMerchantLink("Argos", "https://discountcode.theguardian.com/uk/Argos")
  val Amazon = DiscountCodeMerchantLink("Amazon", "https://discountcode.theguardian.com/uk/amazon")
  val Currys = DiscountCodeMerchantLink("Currys PC World", "https://discountcode.theguardian.com/uk/currys")
  val JdSports = DiscountCodeMerchantLink("JD Sports", "https://discountcode.theguardian.com/uk/jd-sports")

  val links = List(
    Deliveroo,
    Travelodge,
    FunkyPigeon,
    Wayfair,
    Groupon,
    TUI,
    Very,
    RiverIsland,
    Argos,
    Amazon,
    Currys,
    JdSports
  )

  def shouldShowWidget(path:String): Boolean ={
    widgetPaths.contains(path)
  }

 private val widgetPaths = Set(
    "food/2018/oct/20/miguel-barclay-one-pound-meals-budget-friendly-lunch-dinner-recipes",
    "lifeandstyle/2017/nov/03/if-you-buy-a-ready-made-lunch-every-day-youre-throwing-away-1288-a-year",
    "money/2017/sep/29/how-to-save-money-on-going-out",
    "money/2017/sep/27/how-to-save-money-on-travel-and-commuting",
    "money/2017/sep/26/how-to-save-money-broadband-mobile-phones",
    "money/2017/sep/28/how-to-save-money-on-household-bills",
    "money/2017/sep/25/how-to-save-money-on-your-shopping",
    "money/2017/aug/31/share-your-best-money-saving-tips",
    "money/2017/apr/20/swap-flights-trains-europe-summer-holidays-fixperts-energy-prices",
    "money/2017/apr/08/potted-guide-gardening-budget-frances-tophill-jane-perrone-diarmuid-gavin",
    "money/2017/jan/15/skiing-shop-around-reduce-costs-accommodation-clothes-gear-food",
    "money/2016/dec/17/seven-simple-ways-cut-spending-make-savings-2017",
    "money/2016/jun/15/move-over-amazon-grocery-apps-online-shopping",
    "money/2015/may/25/gardening-is-good-for-your-health-save-money",
    "money/2015/may/18/thrifty-five-a-day-fruit-vegetables-cheaper",
    "lifeandstyle/2015/jan/18/feed-four-for-ten-pounds-in-one-pot",
    "lifeandstyle/2015/jan/18/aldi-lidl-best-budget-wines",
    "money/2014/nov/22/which-supermarket-cheapest-morrisons-aldi-asda",
    "lifeandstyle/2014/oct/27/halloween-outfits-for-10-or-less-and-some-for-much-more",
    "money/2014/aug/09/shopping-bargains-holiday-ipad-save",
    "lifeandstyle/2014/jul/09/jack-monroe-panzanella-salad-recipe",
    "lifeandstyle/2014/jul/02/jack-monroe-giant-crab-ravioli-recipe",
    "lifeandstyle/2014/jun/25/jack-monroe-pork-black-bean-feijoada-recipe",
    "lifeandstyle/2014/jun/11/jack-monroe-chilled-pea-coriander-chilli-soup-recipe",
    "money/2014/may/24/cut-the-cost-holiday"
  )
}
