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
    "money/2014/may/24/cut-the-cost-holiday",
    "lifeandstyle/2014/apr/30/jack-monroe-ribollita-recipe-tuscan-soup",
    "lifeandstyle/2013/dec/19/jack-monroe-oat-battered-kippers-recipe",
    "lifeandstyle/2013/dec/11/jack-monroe-chicken-casserole-recipe",
    "lifeandstyle/2013/nov/27/jack-monroe-tomato-bean-soup-recipe",
    "lifeandstyle/2013/nov/13/jack-monroe-frozen-yoghurt-recipe",
    "money/2013/aug/17/how-find-cheap-hotel-room",
    "money/blog/2012/mar/19/online-shopping-discounts-ask",
    "money/2013/jun/06/mobile-phones-children-buyers-guide",
    "money/2013/apr/26/spring-cleaning-best-prices-essential-products",
    "money/2013/apr/01/online-photo-ordering-great-deals",
    "money/2013/mar/30/inkjet-or-laser-printing-cost-effective",
    "money/2013/feb/15/how-cut-cost-wedding",
    "money/2012/dec/07/buy-christmas-january-sales-prices",
    "money/2012/may/04/store-wars-matalan-tk-maxx",
    "money/2012/jan/06/saving-cash-top-tips",
    "money/blog/2011/nov/03/how-cut-energy-bills-to-100-a-year",
    "money/2011/apr/30/family-four-fed-50-week",
    "money/2011/feb/03/food-processors-best-price",
    "money/2011/feb/10/coffe-machines-price",
    "money/2010/dec/19/how-save-money-new-year",
    "money/2010/nov/25/vacuum-cleaner-price-check",
    "money/2010/nov/11/kinect-best-deals",
    "money/2010/aug/05/edinburgh-festival-insider-tips",
    "money/2010/jul/25/single-people-save-money-bills",
    "money/2010/jul/01/price-comparison-fans"
  )
}
