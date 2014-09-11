package model.commercial.books

import org.scalatest.{FlatSpec, Matchers}
import play.api.libs.json.Json

class BookTest extends FlatSpec with Matchers {

  private val json = Json.parse(
    """{"entity_id":"201","attribute_set_id":"10","type_id":"simple","sku":"9780000034649","name":"Spanish Pronouns & Prepositions",
      |"options_container":"container1","msrp_enabled":"2","msrp_display_actual_price_type":"4","isbn":"9780000034649","publisher":"BARRONS",
      |"author_firstname":"Frank","author_lastname":"Nuessel","url_key":"spanish-pronouns-prepositions","price":"8.4915","weight":"0.0000","msrp":"9.9900",
      |"taxable_amount":"0.0000","width":"0.0000","height":"0.0000","depth":"0.0000","bestseller_rank":"213.0000","status":"1","visibility":"4",
      |"tax_class_id":"2","binding_type":"4","date_published":"2007-01-01 00:00:00","description":"&nbsp;","short_description":"&nbsp;"}""".stripMargin)

  "Book" should "create a Book from json" in {

    json.validate[Book].fold(
      invalid => println(invalid),
      valid => println(valid)
    )

    json.validate[Book].asOpt shouldBe Some(Book(
      title = "Spanish Pronouns & Prepositions",
      author = Some("Frank Nuessel"),
      isbn = "9780000034649",
      price = Some(8.4915),
      offerPrice = None,
      description = Some("&nbsp;"),
      jacketUrl = None,
      buyUrl = None,
      position = Some(213),
      category = None,
      keywordIds = Nil
    ))
  }
}
