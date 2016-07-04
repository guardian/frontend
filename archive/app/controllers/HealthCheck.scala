package controllers

import conf.AllGoodCachedHealthCheck

class HealthCheck extends AllGoodCachedHealthCheck(9003, "/404/www.theguardian.com/Adzip/adzip-fb.html")
