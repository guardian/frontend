package com.gu.integration.test.tags

import org.scalatest.Tag

/**
 * Use this for tests which are ready to be run against prod. This means that all data test attributes, which the test depends on,
 * have been successfully deployed to prod
 */
object ReadyForProd extends Tag("ReadyForProd")