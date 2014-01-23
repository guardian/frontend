package model.commercial.money

import org.scalatest.{Matchers, FlatSpec}
import scala.xml.XML

class CreditCardsApiTest extends FlatSpec with Matchers {

  private val xmlStr =
    """<Cards xmlns="http://api.moneysupemarket.com"><Product xmlns="">
      |  <SourceCode>GU6</SourceCode>
      |  <ProductCode>CC_HALIFAX_ALLINONE_ATIER</ProductCode>
      |  <ApplyUrl>http://www.moneysupermarket.com/shop/media-partner-best-buy-click/?product_sku=CC_HALIFAX_ALLINONE_ATIER&amp;source=GU6&amp;channel_id=112</ApplyUrl>
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
      |  <SourceCode>GU6</SourceCode>
      |  <ProductCode>CC_NATWEST_PLAT_LOW_BT_FEE</ProductCode>
      |  <ApplyUrl>http://www.moneysupermarket.com/shop/media-partner-best-buy-click/?product_sku=CC_NATWEST_PLAT_LOW_BT_FEE&amp;source=GU6&amp;channel_id=112</ApplyUrl>
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
      |  <SourceCode>GU6</SourceCode>
      |  <ProductCode>CC_RBS_PLAT_LOW_BT_FEE</ProductCode>
      |  <ApplyUrl>http://www.moneysupermarket.com/shop/media-partner-best-buy-click/?product_sku=CC_RBS_PLAT_LOW_BT_FEE&amp;source=GU6&amp;channel_id=112</ApplyUrl>
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
      |</Product></Cards>""".stripMargin

  "parse" should "parse Credit Cards from xml feed" in {
    val cards = CreditCardsApi.parse(XML.loadString(xmlStr))

    cards should be(
      Seq(
        CreditCard("Online All In One", "HALIFAX", 0.0, 15, CreditExample(1200.0, 17.95, "a purchase", interestRateFixed = false, 17.9, aprFixed = false, 0.0), "http://www.moneysupermarket.com/medias/sys_master/h38/h32/8805104222238/Halifax.png", "http://www.moneysupermarket.com/shop/media-partner-best-buy-click/?product_sku=CC_HALIFAX_ALLINONE_ATIER&source=GU6&channel_id=112"),
        CreditCard("Platinum Balance Transfer and Purchase Credit Card", "NATWEST", 0.0, 15, CreditExample(1200.0, 16.95, "a purchase", interestRateFixed = false, 16.9, aprFixed = false, 0.0), "http://www.moneysupermarket.com/medias/sys_master/h55/hf8/8815356051486/Natwestplatinum80x50.png", "http://www.moneysupermarket.com/shop/media-partner-best-buy-click/?product_sku=CC_NATWEST_PLAT_LOW_BT_FEE&source=GU6&channel_id=112"),
        CreditCard("Platinum Balance Transfer and Purchase Credit Card", "ROYAL BANK OF SCOTLAND", 0.0, 15, CreditExample(1200.0, 16.95, "a purchase", interestRateFixed = false, 16.9, aprFixed = false, 0.0), "http://www.moneysupermarket.com/medias/sys_master/h57/hf8/8815356117022/RBSPlatim80x51.png", "http://www.moneysupermarket.com/shop/media-partner-best-buy-click/?product_sku=CC_RBS_PLAT_LOW_BT_FEE&source=GU6&channel_id=112")
      ))
  }
}
