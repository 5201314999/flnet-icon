const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const ICONNAME = "flnet";

// const cheerio_html = cheerio.prototype.html
// //不进行中文的实体编码
// cheerio.prototype.html = function wrapped_html() {
//   var result = cheerio_html.apply(this, arguments)

//   if (typeof result === 'string') {
//     result = result.replace(/&#x([0-9a-f]{1,6});/ig, function (entity, code) {
//       code = parseInt(code, 16)

//       // don't unescape ascii characters, assuming that all ascii characters
//       // are encoded for a good reason
//       if (code < 0x80) return entity

//       return String.fromCodePoint(code)
//     })
//   }

//   return result
// }

function formatFile() {
  let src = fs.readdirSync("src");
  src.forEach((item, index) => {
    const filePath = path.join("src", item);
    if (item.includes("iconfont")) {
      const fileSuffix = filePath.slice(filePath.indexOf("."));
      fs.renameSync(filePath, path.join("src", `${ICONNAME}${fileSuffix}`));
    }
    if (item.includes("demo_")) {
      fs.renameSync(filePath, path.join("src", "index.html"));
    }
    if (item.includes("demo.css")) {
      fs.renameSync(filePath, path.join("src", "index.css"));
    }
  });
  //css 换名
  const cssPath = path.join("src", `${ICONNAME}.css`);
  let data = fs.readFileSync(cssPath, "utf8");
  data = data.replace(/iconfont/g, ICONNAME);
  fs.writeFileSync(cssPath, data);
  //html 换名
  data = fs.readFileSync(path.join("src", "index.html"), "utf8");
  data = data.replace(/iconfont/g, ICONNAME);
  data = data.replace("demo.css", "index.css");
  const $ = cheerio.load(data);
  $("title").text(`${ICONNAME} Demo`);
  $('[type="image/x-icon"]').remove();
  $(".logo").attr("style", "height: initial;");
  $(".logo > a").attr("style", "font-size: 120px;");
  $(".logo > a")
    .attr("href", "#")
    .attr("target", "_self")
    .text(ICONNAME);
  $(".nav-more").remove();
  data = $.html();
  fs.writeFileSync(path.join("src", "index.html"), data);
  //js
  const jsPath = path.join("src", `${ICONNAME}.js`);
  data = fs.readFileSync(jsPath, "utf8");
  data = data.replace(/iconfont/g, ICONNAME);
  fs.writeFileSync(jsPath, data);
}

function cleardir(dir) {
  const exists = fs.existsSync(dir);
  if (exists) {
    Array.from(fs.readdirSync(dir)).forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isFile()) {
        fs.unlinkSync(filePath);
      }
    });
  } else {
    fs.mkdirSync(dir);
  }
}

function proccessor() {
  const docs = path.resolve(__dirname, "docs");
  const dist = path.resolve(__dirname, "dist");
  cleardir(docs);
  cleardir(dist);

  fs.readdirSync("src").forEach(file => {
    fs.copyFileSync(path.join("src", file), path.join("docs", file));
  });
  fs.readdirSync("src").forEach(file => {
    if (
      [".css", ".eot", ".svg", ".ttf", ".woff", ".woff2"].includes(
        file.slice(file.indexOf("."))
      ) &&
      file.indexOf("index") === -1
    ) {
      fs.copyFileSync(path.join("src", file), path.join("dist", file));
    }
  });
}

(function main() {
  formatFile();
  proccessor();
})();
