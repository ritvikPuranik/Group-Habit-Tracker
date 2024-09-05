import express, { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import Users from '../utility/userUtils';

const router = express.Router();

passport.use(new LocalStrategy(
  {
    usernameField: 'email', // Use email instead of username
    passwordField: 'password',
  },
  async (email: string, password: string, done: any) => {
    try {
      console.log("Entered LocalStrategy>", email, password);
      const user = await Users.getUser({ email: email });
      console.log("User found>");
      if (!user || !user.id) {
        return done(null, false, { message: `User doesn't exist` });
      }
      // If using hashed passwords, replace this comparison with bcrypt.compare
      if (user.password !== password) return done(null, false, { message: `Incorrect Password` });
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));


// Serialize and deserialize user instances to and from the session
passport.serializeUser(function(user: any, done) {
  process.nextTick(function() {
    console.log("Entered serialize>", user);
    return done(null, {id: user.id, email: user.email, firstName: user.first_name});
  });
});

passport.deserializeUser(async ({id}, done: (err: any, user?: any) => void) => {
  console.log("entered deserialze>", id);
  process.nextTick(async () => {
    try{
      const user: any = await Users.getUser({id: id});
      console.log("user found>", user);
      const {password, ...userWithoutPassword} = user;
      console.log("user without pwd>", userWithoutPassword);
      return done(null, userWithoutPassword);
    }catch(err){
      done(err);
    }
  });

});

const loginHandler = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log("entered login>", req.body, req.session);
  // Use passport.authenticate with a callback to handle the responses
  passport.authenticate('local', (err: any, user: any, info: any) => {
    // Handle error during authentication
    if (err) {
      return res.status(500).json({ success: false, message: 'An error occurred during login.', error: err });
    }

    // Handle case where authentication fails (e.g., incorrect credentials)
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    // If authentication succeeds, log the user in
    req.login(user, (loginErr) => {
      if (loginErr) {
        return res.status(500).json({ success: false, message: 'Failed to log in the user.', error: loginErr });
      }

      // Successful login response
      return res.status(201).json({ success: true, message: 'Login successful!', user: { id: user.id, email: user.email, firstName: user.first_name } });
    });
  })(req, res, next); // Pass req, res, next to the authenticate function
}

router.post('/login', loginHandler);


// Route for registration
router.post('/register', async (req: Request, res: Response, next) => {
  console.log('register>', req.body);
  const { email, password, name } = req.body;
  
  try {
    const id = await Users.findOrCreate(email, password, name);
    if (id) {
      // (req.session as any).registrationData = { //This will be accessed from /login to authenticate the user
      //   email: email,
      //   password: password
      // };
      req.body = {
        email: email,
        password: password,
        name: name
      };
      loginHandler(req, res, next);
    } else {
      res.status(401).send({ error: 'User already exists!' });
    }
  } catch (error) {
    res.status(500).send({ error: 'Server error, please try again later!' });
  }
});

export default router;
