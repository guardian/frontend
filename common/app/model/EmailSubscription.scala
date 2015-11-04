package model

sealed trait SubscriptionResult
case object Subscribed extends SubscriptionResult
case class FailedToSubscribe(message: String) extends SubscriptionResult
