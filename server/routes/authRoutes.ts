import express, { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import User from '../controllers/userController';

const router = express.Router();

passport.use(new LocalStrategy(
  {
    usernameField: 'email', // Use email instead of username
    passwordField: 'password',
  },
  async (email: string, password: string, done: any) => {
    try {
      console.log("Entered LocalStrategy>", email, password);
      const user = await User.getUser({ email: email });
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
    return done(null, {id: user.id, email: user.email, firstName: user.first_name});
  });
});

passport.deserializeUser(async ({id}, done: (err: any, user?: any) => void) => {
  process.nextTick(async () => {
    try{
      const user: any = await User.getUser({id: id});
      const {password, first_name, ...remainingDetails} = user;
      return done(null, {...remainingDetails, firstName: first_name});
    }catch(err){
      done(err);
    }
  });

});

const loginHandler = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Use passport.authenticate with a callback to handle the responses
  passport.authenticate('local', (err: any, user: any, info: any) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'An error occurred during login.', error: err });
    }

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
    const id = await User.createNew(email, password, name);
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

router.post('/logout', async (req: Request, res: Response, next) =>{
  console.log("entered logout");
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Logout failed.', error: err });
    }
    // Clear the session and redirect to login page
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Session destruction failed.', error: err });
      }
      res.clearCookie('connect.sid'); // Clear the cookie used by the session store
      res.status(200).json({ success: true, message: 'Logged out successfully!' });
    });
  });
})

export default router;
