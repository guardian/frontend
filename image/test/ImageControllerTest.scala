package test

import org.scalatest.Matchers
import org.scalatest.FlatSpec
import play.api.test._
import play.api.test.Helpers._
import controllers.ImageController

class ImageControllerTest extends FlatSpec with Matchers {

    /*
  "Image Controller" should "return a transformed JPEG" in Fake {
      val result = ImageController.render("sys-images/Guardian/Pix/pictures/2013/4/13/1365887611548/Danny-Shittu-of-Millwall--014.jpg", "im4java", "n")(TestRequest())
      status(result) should be(200)
      header("Cache-Control", result).get should include("public, max-age=86400")
      header("Content-Type", result).get should be("image/jpeg")
      contentAsString(result).getBytes.length should be(51400) // 
  }
  
  "Image Controller" should "return a transformed PNG" in Fake {
    val result = ImageController.render("sys-images/Guardian/Pix/pictures/2012/7/16/1342432227090/-460.png", "im4java", "n")(TestRequest())
    status(result) should be(200)
    header("Content-Type", result).get should be("image/png")
  }
    */

}
