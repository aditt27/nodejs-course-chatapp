const generateMessageData = (message, username)=> {
    return {
        message,
        username,
        timestamp: new Date().getTime()
    }
}

module.exports = {
    generateMessageData
}