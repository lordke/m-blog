var express = require('express');
var crypto=require('crypto');
var User  = require('../models/user.js');
var Post = require('../models/post.js');
var  multer = require('multer');
var Comment = require("../models/comment.js");
var mongodb = require('../models/db');

/* GET home page.
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});*/
var storage = multer.diskStorage({
    destination:function (req,file,cb) {
        cb(null,'./public/images');
    },
    filename:function (req,file,cb) {
        cb(null,file.originalname)
    }
});


var upload = multer({storage:storage});


function checkLogin(req,res,next) {
    if(!req.session.user){
        req.flash('error','未登录');
        res.redirect('/login');
    }
    next();
}

function checkNotLogin(req,res,next) {
    if (req.session.user) {
        req.flash('error', '已登录!');
        res.redirect('back');//返回之前的页面
    }
    next();
}

module.exports = function (app) {
    app.get('/xj',function (req,res) {
        res.render('xj');
    });

    app.get('/data',function (req,res) {
        var collage = req.query.collage
        var classes = req.query.classes
        var id = parseInt(req.query.id)


            mongodb.open(function (err, db) {
                if (err) {
                    console.log('数据库打开失败1')
                }
                db.collection('xj', function (err, collection) {
                    if (err) {
                        mongodb.close();
                        console.log('数据库打开失败2')
                        console.log(err)
                    }
                    if(id){
                        query={'id':id}
                    }
                    else if(classes){
                        query={'班级':classes}
                    }
                    else{
                        query={'专业':collage}
                    }
                    collection.find(query).toArray(function (err, docs) {
                        mongodb.close();
                        if (err) {
                            console.log('to arry error')
                        }
                        var i=0
                        var str=''
                        while(i<docs.length) {

                            str = str +" \<student>" +
                                "\<id>" + docs[i]['id'] + "\</id>" +
                                "\<姓名>" + docs[i]["姓名"] + "\</姓名>" +
                                "\<性别>" + docs[i]['性别'] + "\</性别>" +
                                "\<班级>" + docs[i]['班级'] + "\</班级>" +
                                "\<专业>" + docs[i]['专业'] + "\</专业>" +
                                "\</student>"
                            
                            i++
                        }
                        str = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><school>" + str + "</school>"
                        res.writeHead(200, {"Content-Type": "application/xml"});
                        res.end(str);

                    })

                })
            })





    });
    
    
    
    
    
    
    
    
    
    
    
    app.get('/', function (req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = parseInt(req.query.p) || 1;
        //查询并返回第 page 页的 10 篇文章
        Post.getTen(null, page, function (err, posts, total) {
            if (err) {
                posts = [];
            }
            res.render('index', {
                title: '主页',
                posts: posts,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 10 + posts.length) == total,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });
    app.get('/reg', checkNotLogin);
    app.get('/reg', function (req, res) {
        res.render('reg', {
            title: '注册',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
    app.post('/reg', checkNotLogin);
  app.post('/reg',function (req, res) {
    var name=req.body.name,
        password=req.body.password,
        password_re = req.body['password-repeat'];
      if(password_re != password){
          req.flash('error','两次密码输入不一致');
          return res.redirect('/reg');
      }
      var md5=crypto.createHash('md5');
      var password=md5.update(req.body.password).digest('Hex');
      var newUser = new User(
          {
              name:name,
              password:password,
              email: req.body.email
          }
      );



      User.get(newUser.name,function (err,user) {
          if(err) {
              req.flash('error', err);
              return res.redirect('/');
          }
          if(user){
              req.flash('error', '用户已存在!');
              return res.redirect('/reg');//返回注册页
          }
          console.log('查询完数据库');
          newUser.save(function (err, user) {
              if (err) {
                  req.flash('error', err);
                  return res.redirect('/reg');//注册失败返回主册页
              }
              req.session.user = newUser;//用户信息存入 session
              req.flash('success', '注册成功!');
              res.redirect('/');//注册成功后返回主页
          });

      });


  });
    app.get('/login', checkNotLogin);
  app.get('/login', function (req, res) {
    res.render('login', { title: '登录',
        title: '登录',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    });
  });
    app.post('/login', checkNotLogin);
  app.post('/login', function (req, res) {
      var md5= crypto.createHash('md5');
      password = md5.update(req.body.password).digest('Hex');
      User.get(req.body.name,function (err,user) {
          if(!user){
              req.flash('errror','用户不存在！');
              return res.redirect('/login')
          }
          if(user.password != password){
              req.flash('error','密码错误！');
              return res.redirect('/login');
          }
          req.session.user=user;
          req.flash('success','登陆成功');
          res.redirect('/');
          
      })
  });
    app.get('/post', checkLogin);
  app.get('/post', function (req, res) {

    res.render('post', { title: '发表',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()});
  });
    app.post('/post', checkLogin);
  app.post('/post', function (req, res) {
      var currentUser = req.session.user;
      var post = new Post(currentUser.name,req.body.title,req.body.post);
      post.save(function (err) {
          if(err){

              req.flash('error',err);
              return res.redirect('/');
          }
          req.flash('success','发布成功');
          res.redirect('/');

      })
  });

    app.get('/logout', checkLogin);
    app.get('/logout', function (req, res) {
      req.session.user = null;
      req.flash('success', '登出成功!');
      res.redirect('/');//登出成功后跳转到主页
  });

    app.get('/upload', checkLogin);
    app.get('/upload', function (req, res) {
        res.render('upload', {
            title: '文件上传',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
    app.post('/upload', checkLogin);
    app.post('/upload', upload.array('field1', 5), function (req, res) {
        req.flash('success', '文件上传成功!');
        res.redirect('/upload');
    });
    app.get('/u/:name',function (req,res) {
        User.get(req.params.name,function(err,user){
            var page = parseInt(req.query.p) || 1;
            console.log('parseInt(req.query.p)'+parseInt(req.query.p));
            console.log('page'+page);
            if(!user){
                req.flash('error','用户不存在');
                res.redirect('/');
            }
            Post.getTen(user.naem,page,function (err,posts,total) {
                console.log('page'+page);
                if(err){
                    req.flash('error',err);
                    res.redirect('/');
                }

                res.render('user', {
                    title: user.name,
                    posts: posts,
                    user : req.session.user,
                    page: page,
                    isFirstPage: (page - 1) == 0,
                    isLastPage: ((page - 1) * 10 + posts.length) == total,
                    success : req.flash('success').toString(),
                    error : req.flash('error').toString()
                });
            });
        });
    });

    app.get('/u/:name/:day/:title',function (req,res) {
        Post.getOne(req.params.name, req.params.day, req.params.title, function (err, post) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            
            res.render('article', {
                title: req.params.title,
                post: post,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });
    app.post('/u/:name/:day/:title', function (req, res) {
        var date = new Date(),
            time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
                date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
        var comment = {
            name: req.body.name,
            email: req.body.email,
            website: req.body.website,
            time: time,
            content: req.body.content
        };
        var newComment = new Comment(req.params.name, req.params.day, req.params.title, comment);
        newComment.save(function (err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('back');
            }
            req.flash('success', '留言成功!');
            res.redirect('back');
        });
    });


    app.get('/edit/:name/:day/:title', checkLogin);
    app.get('/edit/:name/:day/:title', function (req, res) {
        var currentUser = req.session.user;
        Post.edit(currentUser.name, req.params.day, req.params.title, function (err, post) {
            if (err) {
                req.flash('error', err);
                return res.redirect('back');
            }
            res.render('edit', {
                title: '编辑',
                post: post,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });

    app.post('/edit/:name/:day/:title', checkLogin);
    app.post('/edit/:name/:day/:title', function (req, res) {
        var currentUser = req.session.user;
        Post.update(currentUser.name, req.params.day, req.params.title, req.body.post, function (err) {
            var url = encodeURI('/u/' + req.params.name + '/' + req.params.day + '/' + req.params.title);
            if (err) {
                req.flash('error', err);
                return res.redirect(url);//出错！返回文章页
            }
            req.flash('success', '修改成功!');
            res.redirect(url);//成功！返回文章页
        });
    });

    
    

    app.get('/remove/:name/:day/:title', checkLogin);
    app.get('/remove/:name/:day/:title', function (req, res) {
        var currentUser = req.session.user;
        Post.remove(currentUser.name, req.params.day, req.params.title, function (err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('back');
            }
            req.flash('success', '删除成功!');
            res.redirect('/');
        });
    });
    
  app.use(express.static('public'));

    app.get('/archive', function (req, res) {
        Post.getArchive(function (err, posts) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            res.render('archive', {
                title: '存档',
                posts: posts,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });

  };


