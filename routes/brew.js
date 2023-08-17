import { Router } from 'express'
import * as brewController from "../controllers/brew-controller.js"
import passport from 'passport'

const router = Router()

router.get('/stats/:bid', passport.authenticate("jwt", { session: false }), brewController.stats)

router.put('/like', passport.authenticate("jwt", { session: false }),  brewController.like)

router.put('/dislike', passport.authenticate("jwt", { session: false }), brewController.dislike)

router.put('/visit', passport.authenticate("jwt", { session: false }), brewController.visit)

router.put('/own', passport.authenticate("jwt", { session: false }), brewController.own)

router.put('/review', passport.authenticate("jwt", { session: false }), brewController.createReview)

router.get('/review/:bid', brewController.getReview)

router.delete('/review', passport.authenticate("jwt", { session: false }), brewController.deleteReview)


export default router


