package com.gu.discussion.test

import com.gu.automation.core.{GivenWhenThen, WebDriverFeatureSpec}
import com.gu.discussion.step.CommentSteps
import org.scalatest.Tag

class CommentTests extends WebDriverFeatureSpec with GivenWhenThen {

  info("Set of Discussion tests to validate commenting on the NGW website")

  feature("As a signed in registered user I can contribute to a discussion") {

    scenarioWeb("Add a new top level comment to an article") {
      given {
        CommentSteps().iAmSignedInAsStaff()
      }.when {
        _.iViewAnArticleWithComments()
      }.then {
        _.iCanPostANewComment()
      }
    }

    scenarioWeb("Reply to a top level comment") {
      given {
        CommentSteps().iAmSignedInAsStaff()
      }.when {
        _.iViewAnArticleWithComments()
      }.then {
        _.iCanPostANewReply()
      }
    }

    scenarioWeb("Report a comment") {
      given {
        CommentSteps().iAmSignedInAsStaff()
      }.when {
        _.iViewAllComments()
      }.then {
        _.iCanReportAComment()
        //NOTE:  Cannot easily test the endpoint as there is no API but we could use the moderation Tool if necessary
      }
    }

    scenarioWeb("View a users discussion posts", Tag("WIP")) {
      given {
        CommentSteps().iAmSignedInAsStaff()
      }.when {
        _.iViewAllComments()
      }.then {
        _.iCanViewUserCommentHistory()
      }
    }

    /*scenarioWeb("Search a users discussion posts") {
      given {
        CommentSteps().iAmAGuestUser()
      }.when {
        _.iViewAllComments()
      }.then {
        _.iCanSearchUserComments()
      }
    }*/

    scenarioWeb("Recommend a users comment") {
      given {
        CommentSteps().iAmAGuestUser()
      }.when {
        _.iViewAllComments()
      }.then {
        _.iCanRecommendAComment()
      }
    }

    scenarioWeb("Navigate through comment pages") {
      given {
        CommentSteps().iAmAGuestUser()
      }.when {
        _.iViewAllComments()
      }.then {
        _.iCanNavigateCommentPages()
      }
    }

    scenarioWeb("Pick a comment to be Featured") {
      given {
        CommentSteps().iAmSignedInAsAMember()
      }.when {
        _.iCanPostANewComment()
        .iAmSignedInAsStaff()
      }.then {
        //Change this to a method to pick a comment here
        _.iViewAllComments()
      }
    }

  }
}