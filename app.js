const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const multer = require('multer');
const app = express();

// 定义域名
const domain = 'http://192.168.3.182:81';
// 文件上传配置
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        //第二个参数是文件存放的文件夹
        cb(null, __dirname + '/uploads');
    },
    filename: function (req, file, cb) {
        // 第二个参数是文件名
        let d = new Date();
        let filename = d.getFullYear() + (d.getMonth()+1) + d.getDate() + Math.random().toString().substr(2, 8) + '.' + file.originalname.split('.').pop();
        cb(null, filename)
    }
});
const upload = multer({
    storage: storage
});
// 接收post过来的数据
// form data
app.use(bodyParser.urlencoded({extended: true}));
// json
app.use(bodyParser.json());
//解决跨域
app.use(function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*'); //这个表示任意域名都可以访问，这样写不能携带cookie了。
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild, enctype');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE');//设置方法
    next();
});
// 数据库连接
const mydb = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'root',
    database:'test',
    port:3306
});
mydb.connect();

// 注册的路由
app.post('/reg', function(req, res){
    // 接收post过来的数据
        let sql = 'INSERT INTO lofteruser(name, passwd, passwdag) VALUES (?,?,?)';
        mydb.query(sql, [req.body.name, req.body.passwd, req.body.passwdag.toLocaleString()], function(err, result){
            if(err){
                 console.log(err);
                 return ;
             }else if(req.body.passwd!=req.body.passwdag){
                 console.log("请输入相同的密码")
            }
             res.json({result:'ok'});//nodejs是非阻塞的 [{},{},{}]  {as:[{},{}]}   [1,2,3,4]
         })
    })

    app.post('/loginin', function(req, res){
        // 接收post过来的数据
        console.log(req.body)
            let sql = 'SELECT * FROM lofteruser WHERE name = ? LIMIT 0, 1';
            mydb.query(sql, [req.body.name, req.body.passwd.toLocaleString()], function(err, result){
                console.log(result)
                if(err){
                     console.log(err);
                     return ;
                 }if(!req.body.name){
                     console.log("请填入用户名")
                 }
                 if(req.body.passwd != result[0].passwd){
                    res.json({r:'passwd_err'});
                    return ;
                }
                // 表示登录成功
                res.json({r:'success'})
        
             })
        })

app.post('/upload', upload.array('imgs'), function(req, res){
    console.log(req.files);
    let imgs ={
        
        "errno": 0,
        "data": [
            
            
        
        ]
    };
    for (let ind = 0; ind < req.files.length; ind++) {
        imgs.data.push(`${domain}/uploads/${req.files[ind].filename}`);
    }
    res.json(imgs);
});
//信息上传
app.post('/add', function(req, res){
    console.log(req.body);
    let data = [];
    // 循环的方式获取所有的数据放到数组里面
    // for (const key in req.body) {
    //     if (req.body.hasOwnProperty(key)) {
    //         data.push(req.body[key]);
    //     }
    // }
    // data.push(new Date().toLocaleString());
    let sql = 'INSERT INTO share(contents) VALUES(?)';
    mydb.query(sql, [req.body.content], function(err, result){
        if(err){
            console.log(err);
            return ;
        }
        res.json({r:'ok'});
    });
});
//从数据库获取上传数据
app.get('/share', function(req, res){    
    let sql = 'SELECT * FROM share';
    mydb.query(sql, function(err, results){
        if(err){
            console.log(err);
            return ;
        }
        res.json(results);
    });
});
//实现趋势页面内容
app.get('/tend', (req, res) => {
    let sql = 'SELECT * from tend';
    mydb.query(sql, function(err, results){
        res.json(results);
    });
});
//个人中心页面
app.get('/info', (req, res) => {
    let sql = 'SELECT * from tend WHERE uid = ?';
    mydb.query(sql, [req.query.uid],function(err, results){
        res.json(results);
    });
});

// 启用中间：静态资源托管
app.use('/uploads', express.static('uploads'));
app.use(express.static('static'));

app.listen(81, () => {
    console.log('Example app listening on port 81!');
});