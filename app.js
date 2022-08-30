const express = require("express");
const app = express();
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

app.use(express.json());

const filePath = path.join(__dirname, "userData.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: filePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("server is running...");
    });
  } catch (error) {
    console.log(`DB error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

//create user

app.post("/register/",(request,response)=>{
    const{username,name,password,gender,location}=request.body;
    const hashedPassword= await bcrypt.hash(password, 20);
    const userQuery=`SELECT * FROM user WHERE username='${username};`;
    const dbUser= await db.get(userQuery);

    if (dbUser===undefined){
         if (password.length<5){
        response.status(400);
        response.send('Password is too short');
    }else{
        const createQuery=`
        INSERT INTO
        user(username,name,password,gender,location)
        VALUES
        (
            '${username}',
            '${name}',
            '${hashedPassword}',
            '${gender}',
            '${location}'         

        );`;
        const dbResponse= await db.run(createQuery);
        response.send('User created successfully');

    }
        

    }else{
        response.status(400);
        response.send('User already exists');
    };


});

//user login

app.post("/login",async(request,response)=>{
    const{username,password}=request.body;
    const selectUserQuery=`SELECT * FROM user WHERE username='${username}';`;
    const dbUser = await db.get(selectUserQuery);

    if (dbUser === undefined){
        response.status(400);
        response.send('Invalid user');
    }else{
        const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
        if(isPasswordMatched === true){
            response.send('Login success!');

        }else{
            response.status(400);
            response.send('Invalid password');
        }
    }


});

//change password

app.put("/change-password", async(request,response)=>{
    const{username,oldPassword,newPassword}=request.body;
    const userQuery=`SELECT * FROM user WHERE username='${username}';`;
    const dbUser= await db.get(userQuery);
     const isPasswordMatched = await bcrypt.compare(oldPassword,dbUser.password);

     if (isPasswordMatched===true){
         const lengthOfNewPassword= newPassword.length;
         if(lengthOfNewPassword<5){
             response.status(400);
             response.send('Password is too short');
         }else{
             response.send('Password updated');

         }

     }else{
         response.status(400);
         response.send('Invalid current password');
     }
})

module.exports=app;
