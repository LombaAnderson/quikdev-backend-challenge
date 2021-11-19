/* imports */
require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const app = express()

// config JSON response
app.use(express.json())

// Models
const User = require('./models/User')

// Open Route - Public Route
app.get('/', (req, res) => {
      res.status(200).json({ msg: 'Seja bem vindo a nossa API!' })
})

//Private Route
app.get("/user/:id", checkToken, async (req, res) => {

      const id = req.params.id

      //check if user exists
      const user = await User.findById(id, '-password')

      if (!user) {
            return res.status(404).json({ msg: 'Usuário não encontrado!' })
      }

      res.status(200).json({ user })
})

function checkToken(req, res, next) {

      const authHeader = req.headers['authorization']
      const token = authHeader && authHeader.split("")[1]

      if (!token) {
            return res.status(401).json({ msg: 'Acesso negado!' })
      }

      try {

            const secret = process.env.SECRET

            jwt.verify(token, secret)

            next()

      } catch (error) {
            res.status(400).json({ msg: 'Token inválido!' })
      }
}

// Register User
app.post('/auth/register', async (req, res) => {

      const { name, username, birthdate, address, addressNumber, primaryPhone, description, createdAt, password, confirmpassword } = req.body

      // validations
      if (!name) {
            return res.status(422).json({ msg: 'o nome é obrigatório!' })
      }

      if (!username) {
            return res.status(422).json({ msg: 'o usuário é obrigatório!' })
      }

      if (!birthdate) {
            return res.status(422).json({ msg: 'é preciso identificar data do aniversário!' })
      }

      if (!address) {
            return res.status(422).json({ msg: 'confirme seu endereço por favor' })
      }
      if (!addressNumber) {
            return res.status(422).json({ msg: ' confirmação do nº de endereço juntamente com o mesmo!' })
      }

      if (!primaryPhone) {
            return res.status(422).json({ msg: 'seu número de celular precisa estar no formato (XX) XXXX-XXXX' })
      }

      if (!description) {
            return res.status(422).json({ msg: 'descrição do usuário!' })
      }

      if (!createdAt) {
            return res.status(422).json({ msg: 'data de criação do usuário!' })
      }

      if (!password) {
            return res.status(422).json({ msg: 'a senha é obrigatória!' })
      }

      if (!confirmpassword) {
            return res.status(422).json({ msg: 'confirme sua senha!' })
      }

      if (password !== confirmpassword) {
            return res.status(422).json({ msg: 'as senhas não conferem!' })
      }

      // check if user exists
      const userExists = await User.findOne({ address: address })

      if (userExists) {
            return res.status(422).json({ msg: 'endereço não confere, confira por favor!' })
      }

      //create password
      const salt = await bcrypt.genSalt(12)
      const passwordHash = await bcrypt.hash(password, salt)

      // create user
      const user = new User({
            name,
            address,
            password: passwordHash,
      })

      try {

            await user.save()

            res.status(201).json({ msg: 'Usuario criado com sucesso!' })

      } catch (error) {
            console.log(error)
            res.status(500).json({ msg: 'Ocorreu um erro no servidor, tente novamente mais tarde!' })
      }
})

// Login User
app.post("/auth/login", async (req, res) => {
      const { address, password } = req.body

      //validations
      if (!address) {
            return res.status(422).json({ msg: 'coloque seu endereço por favor' })
      }

      if (!password) {
            return res.status(422).json({ msg: 'a senha é obrigatória!' })
      }

      // Check if user exists
      const user = await User.findOne({ address: address })

      if (!user) {
            return res.status(404).json({ msg: 'Usuário não encontrado!' })
      }

      // check if password match
      const checkPassword = await bcrypt.compare(password, user.password)

      if (!checkPassword) {
            return res.status(422).json({ msg: 'Senha inválida!' })
      }

      try {

            const secret = process.env.SECRET

            const token = jwt.sign(
                  {
                        id: user._id,
                  },
                  secret,
            )

            res.status(200).json({ msg: "Autenticação realizada com sucesso!", token })
      } catch (err) {
            console.log(error)

            res.status(500).json({
                  msg: 'Erro no servidor, tente novamente mais tarde!',
            })
      }
})

// Credencials
const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASS

mongoose
      .connect(
            `mongodb+srv://${dbUser}:${dbPassword}@cluster0.g13sc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
      )
      .then(() => {
            app.listen(3000)
            console.log('Conectou ao banco de dados!')
      }).catch((err) => console.log(err))


