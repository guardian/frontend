package model.commercial.money

import org.scalatest.{Matchers, FlatSpec}

class CurrentAccountsApiTest extends FlatSpec with Matchers {

  private val xmlStr =
    """<CurrentAccounts>
      |<Product xmlns:p2="http://www.w3.org/2001/XMLSchema-instance">
      |<AccessBranch>true</AccessBranch>
      |<AccessPostOffice>true</AccessPostOffice>
      |<AccessOnline>false</AccessOnline>
      |<AccessPost>false</AccessPost>
      |<AccessTelephone>false</AccessTelephone>
      |<AccountName>1st Account</AccountName>
      |<ApplyUrl>
      |http://www.moneysupermarket.com/shop/media-partner-best-buy-click/?product_sku=CUR_frstdirect_1st&source=GU6&channel_id=209
      |</ApplyUrl>
      |<BenefitAmount>A range of benefits are available</BenefitAmount>
      |<CategoryName>Rewards</CategoryName>
      |<LogoUrl>
      |http://www.moneysupermarket.com/medias/sys_master/h8e/hdc/8806533103646/savings-first.direct.png
      |</LogoUrl>
      |<InterestRate>0.00</InterestRate>
      |<MonthlyCharge>No account charges</MonthlyCharge>
      |<MinimumBalance>1</MinimumBalance>
      |<OverdraftBuffer>250.00</OverdraftBuffer>
      |<OverdraftRate>15.90</OverdraftRate>
      |<ProviderName>first direct</ProviderName>
      |<RewardAmount>£100 cashback when you switch</RewardAmount>
      |<ServiceCharge p2:nil="true"/>
      |</Product>
      |<Product xmlns:p2="http://www.w3.org/2001/XMLSchema-instance">
      |<AccessBranch>true</AccessBranch>
      |<AccessPostOffice>false</AccessPostOffice>
      |<AccessOnline>true</AccessOnline>
      |<AccessPost>false</AccessPost>
      |<AccessTelephone>false</AccessTelephone>
      |<AccountName>123 Current Account</AccountName>
      |<ApplyUrl>
      |http://www.moneysupermarket.com/shop/media-partner-best-buy-click/?product_sku=CUR_santander_123&source=GU6&channel_id=209
      |</ApplyUrl>
      |<BenefitAmount>A range of benefits are available</BenefitAmount>
      |<CategoryName>Rewards</CategoryName>
      |<LogoUrl>
      |http://www.moneysupermarket.com/medias/sys_master/h50/h7d/8827208990750/santander.png
      |</LogoUrl>
      |<InterestRate>3.00</InterestRate>
      |<MonthlyCharge>£2.00 per month</MonthlyCharge>
      |<MinimumBalance>3000</MinimumBalance>
      |<OverdraftBuffer>12.00</OverdraftBuffer>
      |<OverdraftRate>0.00</OverdraftRate>
      |<ProviderName>Santander</ProviderName>
      |<RewardAmount>Up to 3% cashback on household bills</RewardAmount>
      |<ServiceCharge p2:nil="true"/>
      |</Product>
      |<Product xmlns:p2="http://www.w3.org/2001/XMLSchema-instance">
      |<AccessBranch>true</AccessBranch>
      |<AccessPostOffice>true</AccessPostOffice>
      |<AccessOnline>false</AccessOnline>
      |<AccessPost>false</AccessPost>
      |<AccessTelephone>false</AccessTelephone>
      |<AccountName>Reward Current Account</AccountName>
      |<ApplyUrl>
      |http://www.moneysupermarket.com/shop/media-partner-best-buy-click/?product_sku=CUR_halifax_Reward&source=GU6&channel_id=209
      |</ApplyUrl>
      |<BenefitAmount>A range of benefits are available</BenefitAmount>
      |<CategoryName>Rewards</CategoryName>
      |<LogoUrl>
      |http://www.moneysupermarket.com/medias/sys_master/hdf/hbe/8825611452446/Halifax.jpg
      |</LogoUrl>
      |<InterestRate p2:nil="true"/>
      |<MonthlyCharge>No account charges</MonthlyCharge>
      |<MinimumBalance>1000</MinimumBalance>
      |<OverdraftBuffer>50.00</OverdraftBuffer>
      |<OverdraftRate>0.00</OverdraftRate>
      |<ProviderName>Halifax</ProviderName>
      |<RewardAmount>£100</RewardAmount>
      |<ServiceCharge p2:nil="true"/>
      |</Product>
      |</CurrentAccounts>""".stripMargin

  "parse" should "parse Current Accounts from xml feed" in {
    val accounts = CurrentAccountsApi.parse(CurrentAccountsApi.transform(xmlStr))

    accounts should be(Seq(

      CurrentAccount("first direct", "1st Account", 0.0, 1.0, 15.9, 250.0,
        "http://www.moneysupermarket.com/medias/sys_master/h8e/hdc/8806533103646/savings-first.direct.png",
        "http://www.moneysupermarket.com/shop/media-partner-best-buy-click/?product_sku=CUR_frstdirect_1st&source=GU6&channel_id=209"),

      CurrentAccount("Santander", "123 Current Account", 3.0, 3000.0, 0.0, 12.0,
        "http://www.moneysupermarket.com/medias/sys_master/h50/h7d/8827208990750/santander.png",
        "http://www.moneysupermarket.com/shop/media-partner-best-buy-click/?product_sku=CUR_santander_123&source=GU6&channel_id=209"),

      CurrentAccount("Halifax", "Reward Current Account", 0.0, 1000.0, 0.0, 50.0,
        "http://www.moneysupermarket.com/medias/sys_master/hdf/hbe/8825611452446/Halifax.jpg",
        "http://www.moneysupermarket.com/shop/media-partner-best-buy-click/?product_sku=CUR_halifax_Reward&source=GU6&channel_id=209")
    ))
  }
}
