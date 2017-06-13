require! './test.ls': {expect}
require! '..': netrc

suite \netrc

const TEXT = """
machine nanika.example.com
# comment for nanika.example.com
    login dareka@nanika.example.com
    password ****
    anything else
default login anonymous password anon@nanika.example.com
  orphan
"""
test \parse ->
    expect netrc.parse TEXT
    .to.eql {
        default:
            login: \anonymous
            password: 'anon@nanika.example.com'
        machine:
            'nanika.example.com':
                login: 'dareka@nanika.example.com'
                password: \****
                anything: \else
    }

test \index ->
    expect netrc 'nanika.example.com', __dirname + '/fixture'
    .to.become {
        login: 'dareka@nanika.example.com'
        password: \****
        anything: \else
    }


suite \read
test 'No files specified' ->
    expect netrc.read []
    .to.be.rejected-with /^No files specified$/
test \ENOENT ->
    expect netrc.read __dirname + '/noexistent'
    .to.be.rejected-with /^ENOENT/
test \fixture ->
    expect netrc.read [__dirname + '/noexistent', __dirname + '/fixture']
    .to.be.fullfilled
