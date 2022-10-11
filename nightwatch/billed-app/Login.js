describe('Demo test Ecosia.org', function() {
    test('search for nightwatch', function(browser) {
      browser
        .url('https://www.ecosia.org/')
        .waitForElementVisible('body')
        .assert.titleContains('Ecosia')
        .assert.visible('input[type=search]')
        .sendKeys('input[type=search]', 'nightwatch')
        .assert.visible('button[type=submit]')
        .click('button[type=submit]')
        .assert.textContains('.layout__content', 'Nightwatch.js')
        .end();
    })
  });