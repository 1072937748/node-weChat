import user from './user.js'
import group from './group.js'
import robot from './robot.js'
import chat from './chat.js'
import dialog from './dialog.js'
import singlechat from './singlechat'
import fcricle from './fcricle'

export default app => {
	app.use('/user', user)
	app.use('/group', group)
	app.use('/robot', robot)
	app.use('/chat', chat)
	app.use('/dialog', dialog)
	app.use('/fcricle', fcricle)
	app.use('/singlechat', singlechat)
}