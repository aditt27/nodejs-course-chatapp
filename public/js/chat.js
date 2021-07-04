const socket = io()

//html elements
const $messageForm = document.querySelector('#sendMessage')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormSubmit = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#sendLocation')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')

//mustache templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Get query string
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = ()=> {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('connect', () => {
    console.log('socket.io connection id:', socket.id);
});

socket.emit('join', { username, room }, (error)=> {
    if(error) {
        alert(error.message)
        location.href = '/'
    }
})

socket.on('message', (data)=> {
    //console.log(data)
    const html = Mustache.render(messageTemplate, {
        message: data.message,
        username: data.username,
        timestamp: moment(data.timestamp).format('D MMM YY HH:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('roomData', (data)=> {
    console.log(data)
    const html = Mustache.render(sidebarTemplate, {
        room: data.room,
        users: data.users
    })
    $sidebar.innerHTML = html
})

socket.on('locationMessage', (data)=> {
    //console.log(data)
    const html = Mustache.render(locationTemplate, {
        message: data.message.message,
        url: data.message.url,
        username: data.username,
        timestamp: moment(data.timestamp).format('D MMM YY HH:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

$messageForm.addEventListener('submit', (e)=> {
    e.preventDefault()

    const message = e.target.elements.inputMessage.value

    //disable input when sending message
    $messageFormSubmit.setAttribute('disabled', 'disabled')

    socket.emit('sendMessage', message, (info)=> { /* third parameter is event acknowledgement / response*/
        //console.log('Message was delivered')
        //re-enable input when server acknowledge message
        $messageFormSubmit.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if(info) { //if there is response data on event acknowledgement from server
            console.log(info)
        }
    })
})

$sendLocationButton.addEventListener('click', ()=> {
    if(!navigator.geolocation) {
        return console.log('Geolocation is not supported by your browser')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position)=> {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (info)=> {
            $sendLocationButton.removeAttribute('disabled')
            if(info) {
                console.log(info)
            }
        })
    })

})