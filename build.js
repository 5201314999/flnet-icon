const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')
const ICONNAME = 'flnet'

function buildHtml() {
  let source = fs.readdirSync('source')
  source.forEach((item, index) => {
    const filePath = path.join('source', item)
    if (item.includes('iconfont')) {
      const fileSuffix = filePath.slice(filePath.indexOf('.'))
      fs.renameSync(filePath, path.join('source', `${ICONNAME}${fileSuffix}`))
    }
    if (item.includes('demo_')) {
      fs.renameSync(filePath, path.join('source', 'index.html'))
    }
    if(item.includes('demo.css')){
      fs.renameSync(filePath, path.join('source', 'index.css'))
    }
  })
  let data = fs.readFileSync(path.join('source', 'index.html'), 'utf8')
  // data = data.replace(/iconfont/g, ICONNAME)
  // data = data.replace('demo.css', 'index.css')

  const $ = cheerio.load(data)
  $('title').text(`${ICONNAME} Demo`)
  $('[type="image/x-icon"]').remove()
  $('.logo').attr('style', 'height: initial;')
  $('.logo > a').attr('style', 'font-size: 120px;')
  $('.logo > a').attr('href', '#').attr('target', '_self').text(ICONNAME)
  $('.nav-more').remove()
  data = $.html()
  fs.writeFileSync(path.join('source', 'index.html'), data)
}

function cleardir (dir) {
  Array.from(fs.readdirSync(dir)).forEach(file => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    if (stat.isFile()) {
      fs.unlinkSync(filePath)
    }
  })
}

function proccessor () {
  cleardir(path.resolve(__dirname, 'docs'))
  cleardir(path.resolve(__dirname, 'src'))
  fs.readdirSync('source').forEach(file => {
    fs.copyFileSync(path.join('source', file), path.join('docs', file))
  })
  fs.readdirSync('source').forEach(file => {
    if (['.css', '.eot', '.svg', '.ttf', '.woff', '.woff2'].includes(file.slice(file.indexOf('.'))) && file.indexOf('demo') === -1) {
      fs.copyFileSync(path.join('source', file), path.join('src', file))
    }
  })
}

(function main () {
  buildHtml()
  proccessor()
})();