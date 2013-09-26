var config = module.exports

config['Bean Tests'] = {
    environment: 'browser'
  , sources: [
        'node_modules/qwery/qwery.js'
      , 'tests/support/syn/synthetic.js'
      , 'tests/support/syn/mouse.js'
      , 'tests/support/syn/browsers.js'
      , 'tests/support/syn/key.js'
      , 'tests/noconflict_fixture.js'
      , 'src/bean.js'
      , 'tests/common.js'
    ]
  , tests: [
        'tests/*-test.js'
    ]
}