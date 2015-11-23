package model

sealed trait SubscriptionResult
case object Subscribed extends SubscriptionResult
case object InvalidEmail extends SubscriptionResult
case object OtherError extends SubscriptionResult
