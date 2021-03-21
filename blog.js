const Koa = require("koa");
const app = new Koa();
const OSS = require("ali-oss");
const router = require("koa-router")();
app.use(require("koa-static")(__dirname + "/build"));
var bodyParser = require("koa-bodyparser");
app.use(bodyParser());
var mysql = require("mysql");
const multiparty = require('koa2-multiparty');

//登录oss
const client = new OSS({
  region: "oss-cn-hangzhou",
  accessKeyId: "",
  accessKeySecret: "",
  bucket: "banh-test",
});
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "aA8714871.",
  // password: "123465",
  database: "my_blog",
});

connection.connect((err) => {
  console.log("数据库连接成功"+err);
  connection.query("show tables;", function (err, result) {
    if (err) return console.log(err, result)
    let tableArr = [];
    let ary = [];
    let createTable = {
      article: [
        'create table article(id int(10),title varchar(30),content varchar(5000),content_markDown varchar(5000),catetory_id varchar(10),catetory varchar(10),create_time datetime DEFAULT CURRENT_TIMESTAMP COMMENT "创建时间", `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT "更新时间")',
        " alter table article add primary key (id)",
        "alter table article modify id int auto_increment",
        "alter table article AUTO_INCREMENT=1;",
      ],
      catetory: [
        "create table catetory(name varchar(20),id int(10))",
        " alter table catetory add primary key (id)",
        "alter table catetory modify id int auto_increment;",
        "alter table catetory AUTO_INCREMENT=10000;",
      ],
    };
    if (result) {
      result.forEach((item) => {
        tableArr.push(item.Tables_in_my_blog);
      });
    }

    for (let k in createTable) {
      ary.push(k);
    }
    ary.forEach((item, index) => {
      if (tableArr.indexOf(item) < 0) {
        createTable[item].forEach((_item, _index) => {
          connection.query(_item, function (err) {
            let pro = index === 0 ? "文章表" : "分类表";
            if (err) return console.log(pro + "创建失败" + err);
            console.log(pro + "创建成功");
          });
        });
      }
    });
  });
});

//允许跨域设置
function arrowOrigin(ctx) {
  ctx.set("Access-Control-Allow-Origin", "http://localhost:3000");
  ctx.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild"
  );
  ctx.set("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
  ctx.set("Access-Control-Allow-Credentials", true);
}

//oss上传图片
router.post("/uploadImg", multiparty(), async (ctx) => {
  arrowOrigin(ctx);
  // let img = ctx.request.body.img;
  console.log(ctx.req.body, ctx.req.files)
  let file = ctx.req.files.file;
  let obj = {
    data: "",
    code: 0,
  };

  let res = await client.multipartUpload(file.name, file.path);
  console.log(res)
  obj.code = 1;
  obj.data = res.res.requestUrls[0].split('?')[0];
  ctx.body = obj;

})

//删除文章
router.post("/deleteArticle", async (ctx) => {
  arrowOrigin(ctx);
  let id = ctx.request.body.id;
  let sql = `delete from article where id=${id}`;
  let obj = {
    data: "",
    code: 0,
  };
  let res = await new Promise((resolve, reject) => {
    connection.query(sql, function (err, result) {
      if (err) reject(err);
      resolve(result);
    });
  });
  obj.data = "删除成功";
  obj.code = 1;
  ctx.body = obj;
});
//更新文章
router.post("/updateArticle", async (ctx, next) => {
  arrowOrigin(ctx);
  let data = ctx.request.body;
  console.log(data);
  let sql = `update article set title='${data.title}',content='${data.content}',content_markDown='${data.content_markDown}',catetory_id=${data.catetory_id},catetory='${data.catetory}' where id = ${data.id}`;
  console.log(sql);
  let obj = {
    data: "",
    code: 0,
  };
  let res = await new Promise((resolve, reject) => {
    connection.query(sql, function (err, result) {
      if (err) reject(err);
      resolve(result);
    });
  });
  obj.data = "更新成功";
  obj.code = 1;
  ctx.body = obj;
});
//添加文章
router.post("/addArticle", async (ctx, next) => {
  arrowOrigin(ctx);
  let data = ctx.request.body;
  var sql = `insert into article (title,content,catetory_id,catetory,content_markDown) values ('${data.title}','${data.content}','${data.catetory_id}','${data.catetory}','${data.content_markDown}')`;
  let obj = {
    data: "",
    code: 0,
  };
  let res = await new Promise((resolve, reject) => {
    connection.query(sql, function (err, result) {
      if (err) reject(err);
      resolve(result);
    });
  });
  obj.data = "添加成功";
  obj.code = 1;
  ctx.body = obj;
});
//获取文章列表
router.get("/article_list", async (ctx, next) => {
  arrowOrigin(ctx);
  let catetory_id = ctx.query.catetory_id;
  var sql = catetory_id
    ? `SELECT * from article where catetory_id=${catetory_id}`
    : "SELECT * from article";
  let obj = {
    data: [],
    code: 0,
  };
  let arr = await new Promise((resolve, reject) => {
    connection.query(sql, function (err, result) {
      if (err) reject(err);

      resolve(result);
    });
  });

  obj.data = arr;
  obj.code = 1;
  ctx.body = obj;
});
//通过id查询文章
router.get("/article_detail", async (ctx, next) => {
  arrowOrigin(ctx);
  let id = ctx.query.id;
  var sql = `SELECT * from article where id=${id}`;
  let obj = {
    data: [],
    code: 0,
  };
  let arr = await new Promise((resolve, reject) => {
    connection.query(sql, function (err, result) {
      if (err) reject(err);
      resolve(result);
    });
  });
  obj.data = arr[0];
  obj.code = 1;
  ctx.body = obj;
});

//删除分类
router.post("/deleteCatetory", async (ctx, next) => {
  arrowOrigin(ctx);
  let delete_id = ctx.request.body.id;
  let obj = {
    message: "",
    code: 0,
  };
  let art = await new Promise((resolve, reject) => {
    connection.query(
      ` select * from article where catetory_id = ${delete_id}`,
      function (err, result) {
        if (err) reject(err);
        resolve(result);
      }
    );
  });
  if (art.length) {
    obj.message = "请先删除此分类下所有文章";
  } else {
    let res = await new Promise((resolve, reject) => {
      connection.query(
        ` delete FROM catetory WHERE id = '${delete_id}' `,
        function (err, result) {
          if (err) reject(err);
          resolve(result);
        }
      );
    });
    obj.code = 1;
  }

  ctx.body = obj;
});
//添加分类
router.post("/addCatetory", async (ctx, next) => {
  arrowOrigin(ctx);
  let obj = {
    message: "",
    code: 0,
  };
  let data = ctx.request.body;
  let res = await new Promise((resolve, reject) => {
    var sql = `insert into catetory (name ) values ('${data.name}')`;
    connection.query(sql, function (err, result) {
      if (err) reject(err);
      resolve(result);
    });
  });
  obj.message = "添加成功";
  obj.code = 1;
  ctx.body = obj;
});
//获取分类
router.get("/catetory", async (ctx, next) => {
  arrowOrigin(ctx);
  var sql = "SELECT name,id from catetory";
  let obj = {
    data: [],
    code: 0,
  };
  let arr = await new Promise((resolve, reject) => {
    connection.query(sql, function (err, result) {
      if (err) console.log(err);
      resolve(result);
    });
  });
  obj.data = arr;
  obj.code = 1;
  ctx.body = obj;
});
//登录
router.post("/sign", async (ctx, next) => {
  arrowOrigin(ctx);
  let obj = {
    message: "",
    code: 0,
  };
  let data = ctx.request.body;
  console.log(data);
  if (data.userName === "banhe" && data.password === "a8714871") {
    obj.message = "登陆成功";
    obj.code = 1;
    ctx.cookies.set("isLogin", "1", {
      domain: "http://localhost:3000/",
      path: "",
      maxAge: 1000 * 60 * 60 * 1,
      expires: new Date("2021-02-21"),
      httpOnly: false,
      overwrite: false,
    });
  } else {
    obj.message = "账号或密码错误";
    obj.code = 0;
  }
  ctx.response.body = {
    status: 200,
  };
  ctx.body = obj;
});
app.use(async (ctx, next) => {
  arrowOrigin(ctx);
  if (ctx.method == "OPTIONS") {
    ctx.body = 200;
  } else {
    await next();
  }
});
console.log(123132)
app.use(router.routes());
app.listen(8000);
