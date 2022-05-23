package commercial.model.merchandise.books

import commercial.model.merchandise.Book
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.DoNotDiscover
import play.api.libs.json.Json
import test.ConfiguredTestSuite

@DoNotDiscover class BookTest extends AnyFlatSpec with Matchers with ConfiguredTestSuite {

  private val json = Json.parse(
    """{"sku":"9780001712768",
      |"isbn":"9780001712768",
      |"name":"In a People House",
      |"author_firstname":"Dr",
      |"author_lastname":"Seuss",
      |"bestseller_rank":"223.0000",
      |"guardian_bestseller_rank":"222.0000",
      |"categories":[
      |{"name":"Picture books","bic":"YYTG,YBC"},
      |{"name":"All fiction and poetry","bic":
      |"FC,FA,FF,FH,FJ,FK,FL,FM,FP,FQ,FR,FT,FV,FW,FX,FY,FZ,FG,CTC,FBC,FBN,FBV,FGB,FGC,FGH,FGL,FGM,FGN,FGQ,FGU,FGV,FGW,FNB,FND,FNG,FNS,FS"}
      |],
      |"images":[
      |"http:\/\/guardianbookshop.staging.lab.co.uk\/image\/9df78eab33525d08d6e5fb8d27136e95\/media2\/73e70a25faab42aa1b411b8b59382416.jpg"
      |],
      |"product_url":"http:\/\/guardianbookshop.staging.lab.co.uk\/index.php\/in-a-people-house.html",
      |"regular_price_with_tax":"5.0915",
      |"regular_price_without_tax":"5.0915",
      |"final_price_with_tax":"5.0914",
      |"final_price_without_tax":5.0914}""".stripMargin,
  )

  "Book" should "create a Book from json" in {
    json.validate[Book].asOpt shouldBe Some(
      Book(
        title = "In a People House",
        author = Some("Dr Seuss"),
        isbn = "9780001712768",
        price = Some(5.0915),
        offerPrice = Some(5.0914),
        description = None,
        jacketUrl = Some(
          "http://guardianbookshop.staging.lab.co.uk/image/9df78eab33525d08d6e5fb8d27136e95/media2/73e70a25faab42aa1b411b8b59382416.jpg",
        ),
        buyUrl = Some("http://guardianbookshop.staging.lab.co.uk/index.php/in-a-people-house.html"),
        position = Some(222),
        category = Some("Picture books"),
        keywordIdSuffixes = Nil,
      ),
    )
  }
}
