import { connection as db } from "../config/index.js"  
import { hash, compare } from 'bcrypt'
import { createToken } from "../middleware/UserAuthentication.js";

class Users {
    fetchUsers(req, res) {
        try {
            const strQry = `
                select user_id, first_name, last_name, email, password, phone_number, drivers_license_number, role, created_at
                from Users;
                `
            db.query(strQry, (err, results) => {
              if (err) throw new Error(`Unable to retrieve all users`)
              res.json({
                status: res.statusCode,
                results 
              })
            })
          } catch (e) {
            res.json({
                status: 404,
                msg: e.message
            })
          }
    }
    
    fetchUser(req, res) {
        try{
            const strQry = `
            select user_id, first_name, last_name, email, password, phone_number, drivers_license_number, role, created_at
            from Users where user_id = ${req.params.id};
            `
            db.query(strQry, (err, result) => {
              if (err) throw new Error(err.message)
              res.json({
            status: res.statusCode,
            result: result[0]
              })
            })
          } catch (e) {
            res.json({
              status: 404,
              msg: e.message
            })
          }
    }
    
    async registerUser(req, res) {
        try {
            let data = req.body
              data.password = await hash(data.password, 12)

            let user = {
            email: data.email,
            password: data.password
            } 
            
            let strQry = `
            insert into  Users
            set ?;
            `
            db.query(strQry, [data], (err) => {
            if(err) {
                res.json({
                status: res.statusCode,
                msg: 'This email has already been taken'
            })
          } else {
            const token = createToken(user)
            res.json({
              token,
              msg: 'User registered successfully ✅'
            })
          }
         })   
          } catch (e) {
            res.json({
              status: 404,
              msg: e.message
            })
          }
    }

   async updateUser(req, res) {
        try {
            let data = req.body
            if (data.password) {
              data.password = await hash(data.password, 12)
            }
            const strQry = `
            update Users
            set ?
            where user_id = ${req.params.id}
            `
            db.query(strQry, [data], (err) => {
              if (err) throw new Error('Unable to update user')
                res.json({
                  status: res.statusCode,
                  msg: 'User details updated 🔃'
                })
            })
          } catch (e) {
            res.json({
              status: 404,
              msg: e.message
            })
          }
    }

    deleteUser(req, res) {
        try {
            const strQry = `
            delete from Users 
            where user_id = ${req.params.id}
            `
            db.query(strQry, (err) => {
              if(err) throw new Error('Unable to delete user')
                res.json({
                  status: res.statusCode,
                  msg: 'User deleted 🗑️'
                })
            })
          } catch (e) {
            res.json({
              status: 404,
              msg: e.message
            })
          }
    }

    login(req, res) {
        try {
            const {email, password} = req.body
            const strQry = `
            select user_id, first_name, last_name, email, password, phone_number, drivers_license_number, role, created_at
            from Users
            where email = '${email}'                  
            `
            db.query(strQry, async (err, result) => {             
              if(err) throw new Error(err)
              if(!result?.length) {
                res.json(
                  {
                    status: 401,
                    msg: 'Invalid email. Please provide a valid email or register.'
                  }
                )
              } else {
                const isValidPassword = await compare 
                (password, result[0].password)
                if (isValidPassword) {
                  const token = createToken({
                    email, password
                  })
                  res.json({
                      status: res.statusCode,
                      msg: "Login Successful ✅",
                    token,
                    result: result[0]
                  })
                } else {
                  res.json({
                    status: 401,
                    msg: 'Invalid Password. Please input correct password or register.'
                  })
                }
              }
            })
          } catch (e) {
            res.json({
              status: 404,
              msg: e.message
            })
          }
    }
}

export {
    Users
}