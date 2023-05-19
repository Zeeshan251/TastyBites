const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const path = require("path");
const session = require('express-session');
const MongoDbStore = require('connect-mongodb-session')(session);
const flash = require('connect-flash');

// aquiring from all the routes
const userShop = require("./routes/shop");
const adminProducts = require("./routes/admin");
const restaurants = require("./routes/restaurant");
const authentication = require("./routes/auth");

const MONGO_URI = 'mongodb+srv://tonysrule:jKLKh3bkD5pLbdDx@cluster0.fvc9sga.mongodb.net/sessions';
const store = new MongoDbStore({
  uri:MONGO_URI,
  collection:'sessions'
});

// using Sequelize for connecting databases :
const sequelize = require("./util/database");

//Requiring all the models:
const Admin = require("./models/admin");
const User = require("./models/user");
const Product = require("./models/productAdmin");
const Cart = require('./models/cart');
const Owner = require('./models/restaurantOwner');
const Restaurant = require('./models/restaurant');
const Order = require('./models/order');
const OrderItem = require('./models/orderItems');
const cartItems = require('./models/cartItems');
const { default: mongoose } = require("mongoose");
const { log } = require("console");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
    session({
      secret:'My Secret',
      resave: false,
      saveUninitialized:false,
      store:store
    })
)
app.use(flash());

app.set("view engine", "ejs");
app.set("views", "views");

// storing the newly made user and the admin in the req.user format in the body of the document .
Product.belongsTo(User, {constraints: true, onDelete: 'CASCADE'})
User.hasMany(Product);
User.hasOne(Cart);
Cart.hasOne(User);
Product.belongsTo(Owner, {constraints:true, onDelete: 'CASCADE'})
Owner.hasMany(Product);
Owner.hasOne(Restaurant);
Restaurant.hasOne(Owner);
Cart.belongsToMany(Product, {through: 'cartItems'});
Product.belongsToMany(Cart,{through:'cartItems'});
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through:OrderItem});

app.use((req, res, next) => {
  
    if(!req.session.user){
       return next();
    }

    // console.log(req.session.user.dataValues.id)

    User.findByPk(req.session.user.dataValues.id)
        .then(user =>{
          // console.log('yesss');
            req.user = user;
             
            // console.log(user)

            next();
        })
    
});

app.use((req, res, next) => {
  
  if(!req.session.owner){
     return next();
  }

  // console.log(req.session.user.dataValues.id)

  Owner.findByPk(req.session.owner.dataValues.id)
      .then(owner =>{
        // console.log('yesss');
          req.owner = owner;
           
          console.log(owner)

          next();
      })
  
});


app.use((req,res,next) =>{

    //  basically through res.locals , the value of any variable can be directly used whenever required
    // here in this case, isAuthenticated can be used 
     res.locals.isOwnerAuthenticated = req.session.isOwnerLoggedIn;
     res.locals.isAuthenticated = req.session.isLoggedIn;
     res.locals.isAdminAuthenticated = req.session.isAdminLogged;
     next();
})


app.use((req,res,next)=>{
      Admin.findByPk(1)
      .then(admin =>{
                  req.admin = admin ;
                  next();

      })
      .catch(err=>{
            console.log(err);
      })
})

// writing all the routes for getting the shop,admin and Vendors:

app.use("/admin", adminProducts);
app.use(userShop);
app.use("/restaurant", restaurants);
app.use(authentication);
// establishing the relations user - adminProducts:

mongoose.connect(MONGO_URI);

// synchronizing all the models :
sequelize
  // .sync({force:true})
  .sync()
  .then((result) => {
    
      // if no admin exits then create one
      Admin.findByPk(1).then((admin) => {
        if (!admin) {
          Admin.create({
            adminName: "Zeeshan",
            password:"Zeeshan@123",
            email: "zeeshan@123.com",
          });
        }
      });

      app.listen(3000, () => {
        console.log("Running on port number 3000 and database connected");
      });
    })
  
  .catch((err) => {
    console.log(err);
  });
