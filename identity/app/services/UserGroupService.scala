package services

import com.gu.identity.model.User

object UserGroupService {

    def isUserInGroup(user: User, groupCode: String): Boolean = {
      user.userGroups.exists(existingGroup => {
        existingGroup.packageCode == groupCode.toUpperCase()
      })
    }

}
