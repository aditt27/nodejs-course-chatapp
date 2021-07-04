const users = []

const addUser = ({ userid, username, room })=> {
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //Validate data
    if(!username || !room) {
        return {
            error: 'Username and room are required'
        }
    }

    //Check existing user in the room
    const checkExisingUser = users.find((user)=> {
        return user.username === username && user.room === room
    })
    if(checkExisingUser) {
        return {
            error: 'Username is used'
        }
    }

    //Store user
    const newUser = { userid, username, room }
    users.push(newUser)

    return {
        user: newUser
    }
}

const removeUser = (userid)=> {
    const index = users.findIndex((user)=> {
        return user.userid = userid
    })

    if(index!== -1) {
        return users.splice(index,1)[0]
    }
}

const getUser = (userid)=> {
    return users.find((user)=> {
        return user.userid === userid
    })
}

const getUsersInRoom = (room)=> {
    room = room.trim().toLowerCase()
    return users.filter((user)=> {
        return user.room === room
    })
}

const getAllUsers = ()=> {
    return users
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
    getAllUsers
}