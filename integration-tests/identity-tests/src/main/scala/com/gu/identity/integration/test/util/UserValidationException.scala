package com.gu.identity.integration.test.util

import org.openqa.selenium.WebElement

case class UserValidationException(validationErrorElements : List[FormError]) extends RuntimeException{

}
