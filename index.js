const express = require('express')
const bodyParser = require('body-parser')
const routes = require('./routes')
const history = require('connect-history-api-fallback')
const path = require('path')

const app = new express()

app.use(history({
	rewrites: [{
		from: /^\/api\/.*$/,
		to: function(context) {
			return context.parsedUrl.path
		}
	}]
}))

app.use(bodyParser.urlencoded({limit:'50mb', extended: true}))
app.use(express.static(path.join(__dirname, '../dist')))

routes(app)



app.listen('8081', () => console.log('running at 8081'))