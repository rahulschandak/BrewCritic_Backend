import { Router } from 'express'
import * as userController from '../controllers/user-controller.js'
import passport from 'passport'

const router = Router()

router.post('/login', passport.authenticate('local'), userController.login)

router.post('/register', userController.register)

router.post('/refreshToken', userController.getUser)

router.get('/logout', passport.authenticate("jwt", { session: false }), userController.logout)

router.get('/profile/:uid', userController.getProfile)

router.get('/profile', passport.authenticate("jwt", { session: false }), userController.getProfile)

router.put('/profile', passport.authenticate("jwt", { session: false }), userController.updateUser)

export default router


