const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const statsController = require('../Controllers/statsController');
const authController = require('../Controllers/authController');

const { catchErrors } = require('../handlers/errorHandlers');

router.get('/', catchErrors(storeController.getStores));
router.get('/stores', catchErrors(storeController.getStores));
router.get('/add', authController.isLoggedIn, storeController.addStore);

router.post('/add',
    storeController.upload,
    catchErrors(storeController.resize),
    catchErrors(storeController.createStore)
);

router.post('/add/:id',
    storeController.upload,
    catchErrors(storeController.resize),
    catchErrors(storeController.updateStore)
);


router.get('/stores/:id/edit', catchErrors(storeController.editStore));

router.get('/store/:slug', catchErrors(storeController.getStoreBySlug));

router.get('/stats', catchErrors(statsController.showStats));

router.get('/tags', catchErrors(storeController.getStoresByTag));
router.get('/tags/:tag', catchErrors(storeController.getStoresByTag));

router.get('/login', userController.loginForm);

router.post('/login', authController.login);


router.get('/register', userController.registerForm);

router.post('/register',
    userController.validateRegister,
    userController.register,
    authController.login
);

router.get('/logout', authController.logout);

// router.get('/reverse/:name', (req, res) => {
//   const reverse = [...req.params.name].reverse().join('');
//   res.send(reverse);
// });

module.exports = router;
