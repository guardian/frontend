package model.commercial.money

import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}
import test.ConfiguredTestSuite
import scala.xml.XML

@DoNotDiscover class CreditCardsApiTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  private val xmlStr =
    """<Cards xmlns="http://api.moneysupemarket.com"><Product xmlns="">
      |  <SourceCode>GU15</SourceCode>
      |  <ProductCode>CC_HALIFAX_ALLINONE_ATIER</ProductCode>
      |  <ApplyUrl>http://www.moneysupermarket.com/shop/media-partner-best-buy-click/?product_sku=CC_HALIFAX_ALLINONE_ATIER&amp;source=GU15&amp;channel_id=112</ApplyUrl>
      |  <LogoUrl>http://www.moneysupermarket.com/medias/sys_master/h38/h32/8805104222238/Halifax.png</LogoUrl>
      |  <ProviderName>HALIFAX</ProviderName>
      |  <ProviderSiteUrl />
      |  <RepresentiveApr>17.90</RepresentiveApr>
      |  <RepresentiveAprIsFixedRate>false</RepresentiveAprIsFixedRate>
      |  <InterestRate>17.95</InterestRate>
      |  <InterestRateDescription>a purchase</InterestRateDescription>
      |  <InterestRateIsFixedRate>false</InterestRateIsFixedRate>
      |  <AmountOfCredit>1200.00</AmountOfCredit>
      |  <Fee>0.00</Fee>
      |  <FeeDescription />
      |  <CardName>Online All In One</CardName>
      |  <Duration p2:nil="true" xmlns:p2="http://www.w3.org/2001/XMLSchema-instance" />
      |  <BalanceTransferRate>0.00</BalanceTransferRate>
      |  <BalanceTransferRateDuration>15</BalanceTransferRateDuration>
      |  <BalanceTransferFee>0.80</BalanceTransferFee>
      |  <PurchaseRate>0.00</PurchaseRate>
      |  <PurchaseRateDuration>15</PurchaseRateDuration>
      |  <InterestFreePeriod>56</InterestFreePeriod>
      |  <CashbackNotes />
      |  <RewardNotes>There are no rewards with this card.</RewardNotes>
      |  <OrderId>0</OrderId>
      |  <Category>balance transfer and purchase</Category>
      |</Product><Product xmlns="">
      |  <SourceCode>GU15</SourceCode>
      |  <ProductCode>CC_NATWEST_PLAT_LOW_BT_FEE</ProductCode>
      |  <ApplyUrl>http://www.moneysupermarket.com/shop/media-partner-best-buy-click/?product_sku=CC_NATWEST_PLAT_LOW_BT_FEE&amp;source=GU15&amp;channel_id=112</ApplyUrl>
      |  <LogoUrl>http://www.moneysupermarket.com/medias/sys_master/h55/hf8/8815356051486/Natwestplatinum80x50.png</LogoUrl>
      |  <ProviderName>NATWEST</ProviderName>
      |  <ProviderSiteUrl />
      |  <RepresentiveApr>16.90</RepresentiveApr>
      |  <RepresentiveAprIsFixedRate>false</RepresentiveAprIsFixedRate>
      |  <InterestRate>16.95</InterestRate>
      |  <InterestRateDescription>a purchase</InterestRateDescription>
      |  <InterestRateIsFixedRate>false</InterestRateIsFixedRate>
      |  <AmountOfCredit>1200.00</AmountOfCredit>
      |  <Fee>0.00</Fee>
      |  <FeeDescription />
      |  <CardName>Platinum Balance Transfer and Purchase Credit Card</CardName>
      |  <Duration p2:nil="true" xmlns:p2="http://www.w3.org/2001/XMLSchema-instance" />
      |  <BalanceTransferRate>0.00</BalanceTransferRate>
      |  <BalanceTransferRateDuration>15</BalanceTransferRateDuration>
      |  <BalanceTransferFee>0.90</BalanceTransferFee>
      |  <PurchaseRate>0.00</PurchaseRate>
      |  <PurchaseRateDuration>15</PurchaseRateDuration>
      |  <InterestFreePeriod>56</InterestFreePeriod>
      |  <CashbackNotes />
      |  <RewardNotes>You will receive discounts from a range of retailers.</RewardNotes>
      |  <OrderId>1</OrderId>
      |  <Category>balance transfer and purchase</Category>
      |</Product><Product xmlns="">
      |  <SourceCode>GU15</SourceCode>
      |  <ProductCode>CC_RBS_PLAT_LOW_BT_FEE</ProductCode>
      |  <ApplyUrl>http://www.moneysupermarket.com/shop/media-partner-best-buy-click/?product_sku=CC_RBS_PLAT_LOW_BT_FEE&amp;source=GU15&amp;channel_id=112</ApplyUrl>
      |  <LogoUrl>http://www.moneysupermarket.com/medias/sys_master/h57/hf8/8815356117022/RBSPlatim80x51.png</LogoUrl>
      |  <ProviderName>ROYAL BANK OF SCOTLAND</ProviderName>
      |  <ProviderSiteUrl />
      |  <RepresentiveApr>16.90</RepresentiveApr>
      |  <RepresentiveAprIsFixedRate>false</RepresentiveAprIsFixedRate>
      |  <InterestRate>16.95</InterestRate>
      |  <InterestRateDescription>a purchase</InterestRateDescription>
      |  <InterestRateIsFixedRate>false</InterestRateIsFixedRate>
      |  <AmountOfCredit>1200.00</AmountOfCredit>
      |  <Fee>0.00</Fee>
      |  <FeeDescription />
      |  <CardName>Platinum Balance Transfer and Purchase Credit Card</CardName>
      |  <Duration p2:nil="true" xmlns:p2="http://www.w3.org/2001/XMLSchema-instance" />
      |  <BalanceTransferRate>0.00</BalanceTransferRate>
      |  <BalanceTransferRateDuration>15</BalanceTransferRateDuration>
      |  <BalanceTransferFee>0.90</BalanceTransferFee>
      |  <PurchaseRate>0.00</PurchaseRate>
      |  <PurchaseRateDuration>15</PurchaseRateDuration>
      |  <InterestFreePeriod>56</InterestFreePeriod>
      |  <CashbackNotes />
      |  <RewardNotes>You will receive discounts from a range of retailers.</RewardNotes>
      |  <OrderId>2</OrderId>
      |  <Category>balance transfer and purchase</Category>
      |</Product><Product xmlns="">
      |  <SourceCode>GU15</SourceCode>
      |  <ProductCode>CC_SANTANDER_123</ProductCode>
      |  <ApplyUrl>http://www.moneysupermarket.com/credit-cards/details/?productCode=CC_SANTANDER_123&amp;source=GU15</ApplyUrl>
      |  <LogoUrl>http://www.moneysupermarket.com/medias/sys_master/he0/hc8/8834285305886/Santander123_contactless.png</LogoUrl>
      |  <ProviderName>Santander</ProviderName>
      |  <ProviderSiteUrl />
      |  <RepresentiveApr>16.50</RepresentiveApr>
      |  <RepresentiveAprIsFixedRate>false</RepresentiveAprIsFixedRate>
      |  <InterestRate>12.70</InterestRate>
      |  <InterestRateDescription>a purchase</InterestRateDescription>
      |  <InterestRateIsFixedRate>false</InterestRateIsFixedRate>
      |  <AmountOfCredit>1200.00</AmountOfCredit>
      |  <Fee>24.00</Fee>
      |  <FeeDescription>annual</FeeDescription>
      |  <CardName>123 Credit Card</CardName>
      |  <Duration p2:nil="true" />
      |  <BalanceTransferRate>0.00</BalanceTransferRate>
      |  <BalanceTransferRateDuration>23</BalanceTransferRateDuration>
      |  <BalanceTransferFee>0.00</BalanceTransferFee>
      |  <PurchaseRate>0.00</PurchaseRate>
      |  <PurchaseRateDuration>23</PurchaseRateDuration>
      |  <InterestFreePeriod>56</InterestFreePeriod>
      |  <CashbackNotes>You will earn 1% cashback at all major supermarkets; 2% cashback at all major department stores; 3% cashback at all major petrol stations, and on National Rail and Transport for London travel (on combined spend of up to &#163;300 a month). T&amp;Cs apply, refer to provider for full details.</CashbackNotes>
      |  <RewardNotes>You will earn 1% cashback at all major supermarkets; 2% cashback at all major department stores; 3% cashback at all major petrol stations, and on National Rail and Transport for London travel (on combined spend of up to &#163;300 a month). T&amp;Cs apply, refer to provider for full details.</RewardNotes>
      |  <OrderId>0</OrderId>
      |  <Category>purchase</Category>
      |</Product></Cards>""".stripMargin

  "parse" should "parse Credit Cards from xml feed" in {

    object CreditCardsApi extends CreditCardsApi {
      protected val adTypeName = "Credit Cards - Test"
      protected lazy val path = "credit-cards/test"
    }
    val cards = CreditCardsApi.parse(XML.loadString(xmlStr))

    cards should be(
      Seq(
        CreditCard("Online All In One", "HALIFAX", 0.0, 15, 0.80, CreditExample(1200.0, 17.95, "a purchase", interestRateFixed = false, 17.9, aprFixed = false, 0.0), "http://www.moneysupermarket.com/medias/sys_master/h38/h32/8805104222238/Halifax.png", "http://www.moneysupermarket.com/shop/media-partner-best-buy-click/?product_sku=CC_HALIFAX_ALLINONE_ATIER&source=GU15&channel_id=112", "There are no rewards with this card.", "", 17.90, 0.00, 15),
        CreditCard("Platinum Balance Transfer and Purchase Credit Card", "NATWEST", 0.0, 15, 0.90, CreditExample(1200.0, 16.95, "a purchase", interestRateFixed = false, 16.9, aprFixed = false, 0.0), "http://www.moneysupermarket.com/medias/sys_master/h55/hf8/8815356051486/Natwestplatinum80x50.png", "http://www.moneysupermarket.com/shop/media-partner-best-buy-click/?product_sku=CC_NATWEST_PLAT_LOW_BT_FEE&source=GU15&channel_id=112", "You will receive discounts from a range of retailers.", "", 16.90, 0.00, 15),
        CreditCard("Platinum Balance Transfer and Purchase Credit Card", "ROYAL BANK OF SCOTLAND", 0.0, 15, 0.90, CreditExample(1200.0, 16.95, "a purchase", interestRateFixed = false, 16.9, aprFixed = false, 0.0), "http://www.moneysupermarket.com/medias/sys_master/h57/hf8/8815356117022/RBSPlatim80x51.png", "http://www.moneysupermarket.com/shop/media-partner-best-buy-click/?product_sku=CC_RBS_PLAT_LOW_BT_FEE&source=GU15&channel_id=112", "You will receive discounts from a range of retailers.", "", 16.90, 0.00, 15),
        CreditCard(
          name = "123 Credit Card",
          provider = "Santander",
          balanceTransferRate = 0.0,
          balanceTransferRateDuration = 23,
          balanceTransferFee = 0.0,
          example = CreditExample(
            amount = 1200.0,
            interestRate = 12.7,
            interestRateDescription = "a purchase",
            interestRateFixed = false,
            apr = 16.5,
            aprFixed = false,
            fee = 24.0
          ),
          logoUrl = "http://www.moneysupermarket" +
            ".com/medias/sys_master/he0/hc8/8834285305886/Santander123_contactless.png",
          applyUrl = "http://www.moneysupermarket" +
            ".com/credit-cards/details/?productCode=CC_SANTANDER_123&source=GU15",
          rewardNotes = "You will earn 1% cashback at all major supermarkets; 2% cashback at all " +
            "major department stores; 3% cashback at all major petrol stations, and on National " +
            "Rail and Transport for London travel (on combined spend of up to £300 a month). T&Cs " +
            "apply, refer to provider for full details.",
          cashbackNotes = "You will earn 1% cashback at all major supermarkets; 2% cashback at all " +
            "major department stores; 3% cashback at all major petrol stations, and on National " +
            "Rail and Transport for London travel (on combined spend of up to £300 a month). T&Cs " +
            "apply, refer to provider for full details.",
          representativeApr = 16.5,
          purchaseRate = 0.0,
          purchaseRateDuration = 23
        )
      ))

    cards map (_.example.toString) should be(
      Seq(
        "If you spend £1,200 at a purchase interest rate of 17.95% p.a. (variable) your " +
          "representative rate will be 17.9% APR (variable)",
        "If you spend £1,200 at a purchase interest rate of 16.95% p.a. (variable) your " +
          "representative rate will be 16.9% APR (variable)",
        "If you spend £1,200 at a purchase interest rate of 16.95% p.a. (variable) your " +
          "representative rate will be 16.9% APR (variable)",
        "If you spend £1,200 at a purchase interest rate of 12.7% p.a. (variable) with a £24 annual" +
          " fee your representative rate will be 16.5% APR (variable)"
      ))
  }
}
