const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors')

const app = express().use(cors());


const accessTokenSecret = 'somerandomaccesstoken';
const refreshTokenSecret = 'somerandomstringforrefreshtoken';

const users = [
  {
    email: 'john@yahoo.com',
    password: 'passworD1',
  }, {
    email: 'anna@ya.ru',
    password: 'password123member',
  }
]

let refreshTokens = [];
let accessTokens = [];

app.use(bodyParser.json());
app.use(cors())


class ApiError extends Error {
  status;
  errors;

  constructor(status, message, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static UnauthorizedError() {
    return new ApiError(401, 'Пользователь не авторизован')
  }

  static BadRequest(message, errors = []) {
    return new ApiError(400, message, errors);
  }
}

app.post('/login', (req, res) => {
  // read email and password from request body
  const {email, password} = req.body;
  setTimeout(async () => {
    const user = users.find(u => {
      return u.email === email && u.password === password
    });

    if (user) {
      const accessToken = jwt.sign({email: user.email, role: user.role}, accessTokenSecret, {expiresIn: '60m'});
      accessTokens.push(accessToken);

      await res.json({
        success: true,
        accessToken: accessToken,
        authInfo: 'Пользователь успешно авторизован!'
      });
    } else {
      await res.json({
        success: false,
        reason: 'Неверный логин или пароль!'
      });
    }
  }, 1000)

});
app.post('/signup', (req, res) => {
  const {email, password} = req.body;
  const user = users.find(u => {
    return u.email === email
  });
  setTimeout(() => {
    if (user) {
      res.json({
        success: false,
        reason: 'Пользователь с таким email уже зарегистрирован!',
      })
    } else {
      users.push({
        email: email,
        password: password,
      })
      res.json({
        success: true,
        signupInfo: 'Регистрация прошла успешно!'
      });
    }
  }, 1000)

})


app.post('/logout', (req, res) => {
  const {token} = req.body;
  accessTokens = accessTokens.filter(t => t !== token);
  res.json({
    success: true
  });
});

app.post('/changepassword', (req, res) => {
  const {email, oldPassword, newPassword, accessToken} = req.body;
  if (!accessTokens.includes(accessToken)) {
    return res.json({
      success: false,
      error: 'No token'
    });
  } else {
    users.forEach(user => {
      if (user.email === email) {
        if (user.password === oldPassword) {
          user.password = newPassword
          res.json({
            success: true,
            info: 'Пароль успешно изменен!'
          })
          return false
        } else {
          res.json({
            success: false,
            error: 'Неверный старый пароль!'
          })
        }
      }
    })
  }
});


app.listen(port = 3003, () => {
  console.log('Authentication service started on port', port);
});






