package services

import com.google.inject.Singleton
import com.gu.identity.model.{StatusFields, PublicFields, PrivateFields, User}

@Singleton
class UserCreationService {

    def createUser(  email : String, userName : String,  password : String, gnmMarketing : Boolean, thirdPartyMarketing : Boolean) : User = {
      val user = User(
        primaryEmailAddress = email,
        password = Some(password),
        publicFields = PublicFields( username = Some(userName))
      )
      if(gnmMarketing)
        user.getStatusFields().setReceiveGnmMarketing(gnmMarketing)
      if(thirdPartyMarketing)
        user.getStatusFields().setReceive3rdPartyMarketing(thirdPartyMarketing)
      user
    }
}
