package test

import org.scalatest.Matchers
import org.scalatest.FlatSpec
import play.api.test._
import play.api.test.Helpers._
import controllers.ImageController

class ImageControllerTest extends FlatSpec with Matchers {

  "ImageController" should "accept allowed characters in urls" in {
    val ImageController.Path(clean) = "/Guardian/uk/gallery/2008/oct/15/1/GD9210779@Dream-Toys~2008,-the--950.jpg"
    clean should be ("/Guardian/uk/gallery/2008/oct/15/1/GD9210779@Dream-Toys~2008,-the--950.jpg")
  }

  it should "not allow unwanted characters" in {
    evaluating {
      val ImageController.Path(_) = "/Guardian/uk/gallery/200<script>8/oct/15/1/GD9210779@Dream-Toys-2008,-the--950.jpg"
    } should produce [MatchError]
  }

}
