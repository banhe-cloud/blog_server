const Koa = require('koa');
const app = new Koa();
const router = require('koa-router')()
app.use(require('koa-static')(__dirname + '/'))
var bodyParser = require('koa-bodyparser');
app.use(bodyParser());


var mysql = require("mysql");
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "bh_test",
})
connection.connect((err) => {
  console.log('数据库连接成功')
});


//允许跨域设置s
function arrowOrigin(ctx) {
  ctx.set('Access-Control-Allow-Origin', 'http://localhost:3000');
  ctx.set('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  ctx.set('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  ctx.set("Access-Control-Allow-Credentials", true);
}
//添加文章
router.post('/addArticle', async (ctx, next) => {
  arrowOrigin(ctx);  
  let data = ctx.request.body;
  console.log(data.title,data.content,data.catetory_id,data.catetory);
  var sql = `insert into article (title,content,catetory_id,catetory) values ('${data.title}','${data.content}','${data.catetory_id}','${data.catetory}')`;
  let obj = {
    data: "",
    code: 0,
  };
  let res = await new Promise((resolve, reject) => {
    connection.query(sql, function (err, result) {
      if (err) reject(err);
      resolve(result)
    });
  })
  obj.data = "添加成功"
  obj.code = 1;
  ctx.body = obj;
})
//获取文章列表
router.get('/article_list', async (ctx, next) => {
  arrowOrigin(ctx)
  var sql = 'SELECT title,content,catetory_id,catetory from article';
  let obj = {
    data: [],
    code: 0,
  }
  let arr = await new Promise((resolve, reject) => {
    connection.query(sql, function (err, result) {
      if (err) reject(err);

      resolve(result)
    });
  });

  obj.data = arr;
  obj.code = 1;
  ctx.body = obj;

})
//删除分类
router.post('/deleteCatetory', async (ctx, next) => {
  arrowOrigin(ctx);
  let delete_id = ctx.request.body.id;
  let obj = {
    message: '',
    code: 0,
  };
  let art = await new Promise((resolve, reject) => {
    connection.query(` select * from article where catetory_id = ${delete_id}`, function (err, result) {
      if (err) reject(err);
      resolve(result)
    });
  })
  if (art.length) {
    obj.message = '请先删除此分类下所有文章'
  } else {
    let res = await new Promise((resolve, reject) => {
      connection.query(` delete FROM catetory WHERE id = '${delete_id}' `, function (err, result) {
        if (err) reject(err);
        resolve(result)
      });
    });
    obj.code = 1;
  }


  ctx.body = obj;
})
//添加分类
router.post('/addCatetory', async (ctx, next) => {
  arrowOrigin(ctx);
  let obj = {
    message: '',
    code: 0,
  };
  let data = ctx.request.body;
  //查询分类表最后一个的id
  let last = await new Promise((resolve, reject) => {
    connection.query(` select * from catetory order by id DESC limit 1`, function (err, result) {
      if (err) reject(err);
      resolve(result)
    });
  });
  let id = parseInt(last[0].id) + 1;
  let res = await new Promise((resolve, reject) => {
    var sql = `insert into catetory (name,id ) values ('${data.name}',${id})`;
    connection.query(sql, function (err, result) {
      if (err) reject(err);
      resolve(result)
    });
  })
  obj.message = "添加成功";
  obj.code = 1;
  ctx.body = obj;
})
//获取分类
router.get('/catetory', async (ctx, next) => {
  arrowOrigin(ctx)
  var sql = 'SELECT name,id from catetory';
  let obj = {
    data: [],
    code: 0,
  }
  let arr = await new Promise((resolve, reject) => {
    connection.query(sql, function (err, result) {
      if (err) reject(err);
      resolve(result)
    });
  })
  obj.data = arr;
  obj.code = 1;
  ctx.body = obj;

})
//登录
router.post('/sign', async (ctx, next) => {
  arrowOrigin(ctx)
  let obj = {
    message: "",
    code: 0,
  }
  let data = ctx.request.body
  console.log(data)
  if (data.userName === 'banhe' && data.password === 'a8714871') {
    obj.message = "登陆成功";
    obj.code = 1;
    ctx.cookies.set("isLogin", "1", {
      domain: 'http://localhost:3000/',
      path: '',
      maxAge: 1000 * 60 * 60 * 1,
      expires: new Date('2021-02-21'),
      httpOnly: false,
      overwrite: false
    })
  } else {
    obj.message = "账号或密码错误";
    obj.code = 0;
  }
  ctx.response.body = {
    status: 200
  }
  ctx.body = obj
})
app.use(async (ctx, next) => {
  arrowOrigin(ctx)
  if (ctx.method == 'OPTIONS') {
    ctx.body = 200;
  } else {
    await next();
  }
});
app.use(router.routes())
app.listen(6789);