package services

import org.scalatest.FunSuite
import model.AvatarData

import org.scalatest.Matchers

class AvatarSigningServiceTest extends FunSuite with Matchers {


  val base64Payload = "eyJ1c2VybmFtZSI6ImRhdmlkc291cCIsImltYWdlX3VwbG9hZF9zdWNjZXNzIjp0cnVlLCJ1c2VyX2lkIjoiMjE4MDE0MTkiLCJyZXF1aXJlZF9pbWFnZV9ob3N0IjoiaHR0cDpcL1wvc3RhdGljLmd1aW1jb2RlLmNvLnVrIiwiaXNfc29jaWFsIjpmYWxzZX0"


  test("Should correctly sign avatar data") {
    val signingService = new AvatarSigningService("Gary Balls")
    val signature = signingService sign AvatarData("talkboy", "3040245", "http://static.guimcode.co.uk")

    signature should be("eyJ1c2VybmFtZSI6InRhbGtib3kiLCJ1c2VyX2lkIjoiMzA0MDI0NSIsInJlcXVpcmVkX2ltYWdlX2hvc3QiOiJodHRwOi8vc3RhdGljLmd1aW1jb2RlLmNvLnVrIiwiaXNfc29jaWFsIjpmYWxzZX0.K-v6OXoltSP_iFqVPhwpMU_1YuU")
  }

  test("Should validate signature when reading response data") {

    val signingService = new AvatarSigningService("Gary Balls")
    val signature = signingService _sign base64Payload
    val signedString = base64Payload + "." + signature

    signingService.wasUploadSuccessful(signedString) should be(Right(true))

    val wrongSigningService = new AvatarSigningService("Sir Gareth Balls")
    wrongSigningService.wasUploadSuccessful(signedString) should be(Left("Invalid signature"))
  }

  test("Should handle responses without a signature") {
    val signingService = new AvatarSigningService("Gary Balls")
    signingService.wasUploadSuccessful(base64Payload) should be(Left("Bad response from upload:\n" + base64Payload))
  }

  test("Should extract error message if upload fails") {
    val failureResponse = "eyJpbWFnZV91cGxvYWRfc3VjY2VzcyI6ZmFsc2UsImltYWdlX3VwbG9hZF9mYWlsdXJlX21lc3NhZ2UiOiJXZSBjb3VsZG4ndCBsb2FkIHRoYXQgaW1hZ2UgLSB3ZSBvbmx5IGRvIFBORywgSlBFRyBhbmQgR0lGLiJ9"
    val signingService = new AvatarSigningService("Gary Balls")
    val signature = signingService._sign(failureResponse)
    val signedResponse = failureResponse + "." + signature

    signingService.wasUploadSuccessful(signedResponse) should be(Left("We couldn't load that image - we only do PNG, JPEG and GIF."))
  }


}
