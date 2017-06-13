const {promisify} = require('util')
const fs = require('fs')
const path = require('path')
const Tokenizer = require('./tokenizer')

const readFile = promisify(fs.readFile)

module.exports = netrc

netrc.parse = parse
netrc.read = read

async function netrc(hostname, filenames)
{
    const result = parse(await read(filenames))
    if (!hostname)
        return result
    const machine = result.machine[hostname]
    return machine ? machine : result.default
}

async function read(filenames=['.netrc', '_netrc'])
{
    if (!Array.isArray(filenames))
        filenames = [filenames]
    let ret = new Error('No files specified')
    for (let filename of filenames)
        try {
            filename = path.resolve(process.env.HOME, filename)
            return await readFile(filename, {encoding: 'utf8'})
        } catch (err) {
            ret = err
        }
    throw ret
}

function parse(source)
{
    const lexer = new Tokenizer(source)
        .define('COMMENT', /#.*\r?\n/)
        .define('MACRO', /macro\s+.*([^\S\n]*\n){2}/)
        .define('SPACE', /\s+/)
        .define('MACHINE', /machine\s+(\S+)/)
        .define('DEFAULT', /default/)
        .define('PAIR', /(\S+)\s+(\S+)/)
        .define('TOKEN', /\S+/)

    const result = {machine:{}, default:{}}
    let curr = null

    while (lexer.next()) {
        const {name, part, match} = lexer.token
        switch (name) {
            case 'DEFAULT':
                curr = result.default
                break
            case 'MACHINE':
                curr = result.machine[match[1]] = {}
                break
            case 'PAIR':
                if (curr)
                    curr[match[1]] = match[2]
                break
        }
    }
    return result
}
