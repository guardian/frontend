package model.commercial.money

import org.scalatest.{Matchers, FlatSpec}
import scala.xml.XML

class MortgagesApiTest extends FlatSpec with Matchers {

  private val xmlStr =
    """<NewDataSet><!--Comments: GU Products XML updated: 23/01/2014 09:00:03-->
      |<RefProducts><Lender><![CDATA[HSBC]]></Lender><Rate><![CDATA[1.49%]]></Rate><Description><![CDATA[Fixed until 30/04/16]]></Description><OverallCost><![CDATA[3.7]]></OverallCost><Link><![CDATA[http://guardian.lcplc-online.co.uk/BestBuy.aspx?GUProdID=165303&amp;Type=F]]></Link></RefProducts>
      |<RefProducts><Lender><![CDATA[Post Office]]></Lender><Rate><![CDATA[1.63%]]></Rate><Description><![CDATA[Fixed until 31/03/16]]></Description><OverallCost><![CDATA[4.2]]></OverallCost><Link><![CDATA[http://guardian.lcplc-online.co.uk/BestBuy.aspx?GUProdID=165411&amp;Type=F]]></Link></RefProducts>
      |<RefProducts><Lender><![CDATA[HSBC]]></Lender><Rate><![CDATA[1.69%]]></Rate><Description><![CDATA[2.25% discount for 2 years]]></Description><OverallCost><![CDATA[3.7]]></OverallCost><Link><![CDATA[http://guardian.lcplc-online.co.uk/BestBuy.aspx?GUProdID=165305&amp;Type=V]]></Link></RefProducts>
      |</NewDataSet>""".stripMargin

  "parse" should "parse Mortgages from xml feed" in {
    val accounts = MortgagesApi.parse(XML.loadString(xmlStr))

    accounts should be(Seq(
      Mortgage("HSBC", "1.49%", "Fixed until 30/04/16", 3.7, "http://guardian.lcplc-online.co.uk/BestBuy.aspx?GUProdID=165303&amp;Type=F"),
      Mortgage("Post Office", "1.63%", "Fixed until 31/03/16", 4.2, "http://guardian.lcplc-online.co.uk/BestBuy.aspx?GUProdID=165411&amp;Type=F"),
      Mortgage("HSBC", "1.69%", "2.25% discount for 2 years", 3.7, "http://guardian.lcplc-online.co.uk/BestBuy.aspx?GUProdID=165305&amp;Type=V")
    ))
  }
}
