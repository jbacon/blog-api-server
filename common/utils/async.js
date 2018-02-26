exports.asyncWrap = fn => {
	if(fn.length <= 3) {
		return (req, res, next) => {
			return fn(req, res, next).catch(next)
		}
	}
	else if(fn.length === 4) {
		return (err, req, res, next) => {
			return fn(err, req, res, next).catch(next)
		}
	}
}