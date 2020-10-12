package model

sealed trait SubscriptionResult
case object Subscribed extends SubscriptionResult

sealed trait NonsuccessResult extends SubscriptionResult
case object InvalidEmail extends NonsuccessResult
case object OtherError extends NonsuccessResult
