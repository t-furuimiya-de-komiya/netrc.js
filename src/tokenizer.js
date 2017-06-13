const {StringDecoder} = require('string_decoder')


module.exports = class Tokenizer
{
    constructor(target='', opts)
    {
        this.opts = Object.assign({encoding: 'utf8'}, opts)
        this.decoder = new StringDecoder(this.opts.encoding)
        this.target = target
        this.definitions = []
        this.token = {none: true}
    }

    append(str)
    {
        this.target += this.decoder.write(str)
        return this
    }

    define(name, re)
    {
        this.definitions.push({name, re})
        return this
    }

    next()
    {
        for (let {name, re} of this.definitions) {
            let {matched, part, match} = this.match(re)
            if (matched)
                return this.token = {name, part, match}
        }
        this.token = {none: true}
    }

    match(re)
    {
        let match = this.target.match(re)
        let matched = match && match.index === 0
        let part = null
        if (matched) {
            part = match[0]
            this.target = this.target.slice(part.length)
        }
        return {matched, part, match}
    }
}
