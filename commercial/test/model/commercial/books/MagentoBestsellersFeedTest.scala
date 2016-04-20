package model.commercial.books

import org.scalatest.{DoNotDiscover, FlatSpec, Matchers}
import test.ConfiguredTestSuite

import scala.xml.XML

@DoNotDiscover class MagentoBestsellersFeedTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  private val xmlStr =
    """<BestSellers><Category>General</Category>
      |<Entry><Position>1</Position><book><title>Guardian Quick Crosswords 5 &#38; 6</title><author></author><isbn>5038495113238</isbn><price>13.98</price><offerprice>8.00</offerprice><description></description><jacketurl>//c.guim.co.uk/books?Source=BERT&amp;Quality=WEB&amp;Component=FRONTCOVER&amp;EAN13=5038495113238</jacketurl><bookurl>http://www.guardianbookshop.co.uk/BerteShopWeb/viewProduct.do?ISBN=5038495113238</bookurl></book></Entry>
      |<Entry><Position>2</Position><book><title>Twelve Years a Slave</title><author>Solomon Northup</author><isbn>9780141393827</isbn><price>7.99</price><offerprice>6.39</offerprice><description>Solomon Northup is a free man&#44; living in New York&#46; Then he is kidnapped and sold into slavery&#46; Drugged&#44; beaten&#44; given a new name and transported away from his wife and children to a Louisiana cotton plantation&#44; Solomon will die if he reveals his true identity&#46;</description><jacketurl>//c.guim.co.uk/books?Source=BERT&amp;Quality=WEB&amp;Component=FRONTCOVER&amp;EAN13=9780141393827</jacketurl><bookurl>http://www.guardianbookshop.co.uk/BerteShopWeb/viewProduct.do?ISBN=9780141393827</bookurl></book></Entry>
      |<Entry><Position>3</Position><book><title>How to Be Alone</title><author>Sara Maitland</author><isbn>9780230768086</isbn><price>7.99</price><offerprice>6.39</offerprice><description>Learn how to enjoy solitude and find happiness without others</description><jacketurl>//c.guim.co.uk/books?Source=BERT&amp;Quality=WEB&amp;Component=FRONTCOVER&amp;EAN13=9780230768086</jacketurl><bookurl>http://www.guardianbookshop.co.uk/BerteShopWeb/viewProduct.do?ISBN=9780230768086</bookurl></book></Entry>
      |<Entry><Position>4</Position><book><title>1941: The Year That Keeps Returning</title><author>Slavko Goldstein</author><isbn>9781590176733</isbn><price>19.99</price><offerprice>15.49</offerprice><description></description><jacketurl>//c.guim.co.uk/books?Source=BERT&amp;Quality=WEB&amp;Component=FRONTCOVER&amp;EAN13=9781590176733</jacketurl><bookurl>http://www.guardianbookshop.co.uk/BerteShopWeb/viewProduct.do?ISBN=9781590176733</bookurl></book></Entry>
      |<Entry><Position>5</Position><book><title>Examined Life</title><author>Stephen Grosz</author><isbn>9780099549031</isbn><price>8.99</price><offerprice>6.99</offerprice><description>Reveals how the art of insight can illuminate the most complicated&#44; confounding and human of experiences&#46; This title includes stories about our everyday lives: they are about the people we love and the lies that we tell; the changes we bear&#44; and the grief&#46;</description><jacketurl>//c.guim.co.uk/books?Source=BERT&amp;Quality=WEB&amp;Component=FRONTCOVER&amp;EAN13=9780099549031</jacketurl><bookurl>http://www.guardianbookshop.co.uk/BerteShopWeb/viewProduct.do?ISBN=9780099549031</bookurl></book></Entry>
      |</BestSellers>""".stripMargin

  "parse" should "parse books from xml feed" in {
    val books = MagentoBestsellersFeed.parse(XML.loadString(xmlStr))

    books should be(Seq(

      Book("Guardian Quick Crosswords 5 & 6", None, "5038495113238", Some(13.98), Some(8.0), None,
        Some("http://c.guim.co.uk/books?Source=BERT&Quality=WEB&Component=FRONTCOVER&EAN13=5038495113238"),
        Some("http://www.guardianbookshop.co.uk/BerteShopWeb/viewProduct.do?ISBN=5038495113238"), Some(1),
        Some("General"), Nil),

      Book("Twelve Years a Slave", Some("Solomon Northup"), "9780141393827", Some(7.99), Some(6.39),
        Some("Solomon Northup is a free man, living in New York. Then he is kidnapped and sold into slavery. Drugged, beaten, given a new name and transported away from his wife and children to a Louisiana cotton plantation, Solomon will die if he reveals his true identity."),
        Some("http://c.guim.co.uk/books?Source=BERT&Quality=WEB&Component=FRONTCOVER&EAN13=9780141393827"),
        Some("http://www.guardianbookshop.co.uk/BerteShopWeb/viewProduct.do?ISBN=9780141393827"), Some(2),
        Some("General"), Nil),

      Book("How to Be Alone", Some("Sara Maitland"), "9780230768086", Some(7.99), Some(6.39),
        Some("Learn how to enjoy solitude and find happiness without others"),
        Some("http://c.guim.co.uk/books?Source=BERT&Quality=WEB&Component=FRONTCOVER&EAN13=9780230768086"),
        Some("http://www.guardianbookshop.co.uk/BerteShopWeb/viewProduct.do?ISBN=9780230768086"), Some(3),
        Some("General"), Nil),

      Book("1941: The Year That Keeps Returning", Some("Slavko Goldstein"), "9781590176733", Some(19.99), Some(15.49), None,
        Some("http://c.guim.co.uk/books?Source=BERT&Quality=WEB&Component=FRONTCOVER&EAN13=9781590176733"),
        Some("http://www.guardianbookshop.co.uk/BerteShopWeb/viewProduct.do?ISBN=9781590176733"), Some(4),
        Some("General"), Nil),

      Book("Examined Life", Some("Stephen Grosz"), "9780099549031", Some(8.99), Some(6.99),
        Some("Reveals how the art of insight can illuminate the most complicated, confounding and human of experiences. This title includes stories about our everyday lives: they are about the people we love and the lies that we tell; the changes we bear, and the grief."),
        Some("http://c.guim.co.uk/books?Source=BERT&Quality=WEB&Component=FRONTCOVER&EAN13=9780099549031"),
        Some("http://www.guardianbookshop.co.uk/BerteShopWeb/viewProduct.do?ISBN=9780099549031"), Some(5),
        Some("General"), Nil)

    ))
  }
}
