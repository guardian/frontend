package model.commercial.moneysupermarket

import org.scalatest.{Matchers, FlatSpec}
import scala.xml.XML

class EasyAccessApiTest extends FlatSpec with Matchers {

  private val xmlStr =
    """<Savings>
      |<Product xmlns:p2="http://www.w3.org/2001/XMLSchema-instance" ><AccessBranch>false</AccessBranch><AccessInternet>true</AccessInternet><AccessTelephone>false</AccessTelephone><AccessPost>false</AccessPost><AccessCashPoint>false</AccessCashPoint><ApplyUrl>http://www.moneysupermarket.com/shop/media-partner-best-buy-click/?product_sku=SAV_coventry_a9728a4bea5b4357b9e404991c26e3a7&amp;source=GU1&amp;channel_id=116</ApplyUrl><BonusInformation p2:nil="true"/><Category>Easy Access</Category><Currency>Â£</Currency><EligibilityCriteria>Available to UK residents aged 16 or over. Choose a monthly or annual interest option.  Limited to 4 penalty free withdrawals per year. </EligibilityCriteria><InterestPaid>Anniversary</InterestPaid><InterestRate>1.6</InterestRate><LogoUrl>http://www.moneysupermarket.com/medias/sys_master/h98/h4b/8824644435998/coventrybs.png</LogoUrl><MaximumMonthlyInvestment p2:nil="true"/><MinimumMonthlyInvestment p2:nil="true"/><MinimumInvestment>1</MinimumInvestment><NoticeTerm>none</NoticeTerm><ProductName>Online Saver (5)</ProductName><ProductCode>SAV_coventry_a9728a4bea5b4357b9e404991c26e3a7</ProductCode><ProviderName>Coventry Building Society</ProviderName><TransferIn>false</TransferIn><SourceCode>GU1</SourceCode></Product>
      |<Product xmlns:p2="http://www.w3.org/2001/XMLSchema-instance" ><AccessBranch>false</AccessBranch><AccessInternet>true</AccessInternet><AccessTelephone>false</AccessTelephone><AccessPost>false</AccessPost><AccessCashPoint>false</AccessCashPoint><ApplyUrl>http://www.moneysupermarket.com/shop/media-partner-best-buy-click/?product_sku=SAV_tesco_c2872aa51ecf468c8033cfe96b1979d9&amp;source=GU1&amp;channel_id=116</ApplyUrl><BonusInformation>Rate includes 0.80% bonus for 12 months from Â£1 to Â£1,000,000. </BonusInformation><Category>Easy Access</Category><Currency>Â£</Currency><EligibilityCriteria>Available to UK residents aged 18 or over. </EligibilityCriteria><InterestPaid>Yearly</InterestPaid><InterestRate>1.55</InterestRate><LogoUrl>http://www.moneysupermarket.com/medias/sys_master/h99/h4b/8824644468766.png</LogoUrl><MaximumMonthlyInvestment p2:nil="true"/><MinimumMonthlyInvestment p2:nil="true"/><MinimumInvestment>1</MinimumInvestment><NoticeTerm>none</NoticeTerm><ProductName>Internet Saver</ProductName><ProductCode>SAV_tesco_c2872aa51ecf468c8033cfe96b1979d9</ProductCode><ProviderName>Tesco Bank</ProviderName><TransferIn>false</TransferIn><SourceCode>GU1</SourceCode></Product>
      |</Savings>""".stripMargin

  "parse" should "parse Products from Easy Access feed" in {
    val products = EasyAccessApi.parse(XML.loadString(xmlStr))

    products should be(Seq(
      EasyAccessProduct("Coventry Building Society", "Online Saver (5)", 1.6, "http://www.moneysupermarket.com/medias/sys_master/h98/h4b/8824644435998/coventrybs.png", "http://www.moneysupermarket.com/shop/media-partner-best-buy-click/?product_sku=SAV_coventry_a9728a4bea5b4357b9e404991c26e3a7&source=GU1&channel_id=116"),
      EasyAccessProduct("Tesco Bank", "Internet Saver", 1.55, "http://www.moneysupermarket.com/medias/sys_master/h99/h4b/8824644468766.png", "http://www.moneysupermarket.com/shop/media-partner-best-buy-click/?product_sku=SAV_tesco_c2872aa51ecf468c8033cfe96b1979d9&source=GU1&channel_id=116")
    ))
  }
}
