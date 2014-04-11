package services

import org.scalatest.FunSuite
import model.AvatarData

import org.scalatest.Matchers

class AvatarSigningServiceTest extends FunSuite with Matchers {

  test("Should correctly sign avatar data") {
    val signingService = new AvatarSigningService("Gary Balls")
    val signature = signingService sign AvatarData("talkboy", "3040245", "http://static.guimcode.co.uk")

    signature should be("eyJ1c2VybmFtZSI6InRhbGtib3kiLCJ1c2VyX2lkIjoiMzA0MDI0NSIsInJlcXVpcmVkX2ltYWdlX2hvc3QiOiJodHRwOi8vc3RhdGljLmd1aW1jb2RlLmNvLnVrIiwiaXNfc29jaWFsIjpmYWxzZX0.K-v6OXoltSP_iFqVPhwpMU_1YuU")
  }


}
