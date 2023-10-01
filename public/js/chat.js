const socket = io() 

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('Button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const siderbarTemplate = document.querySelector('#sidebar-template').innerHTML
// option
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
    // new message element
    const $newMessage = $messages.lastElementChild

    // height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // visble height
    const  visibleHeight = $messages.offsetHeight

    //height of messages container
    const containerHeight = $messages.scrollHeight

    // how far have i scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset ) {
        $messages.scrollTop = $messages.scrollHeight
    }

}

socket.on('locationMessage', (locationMessage) => {
    console.log(locationMessage);
    const html = Mustache.render(locationTemplate, {
        username: locationMessage.username,
        location: locationMessage.url,
        createdAt: moment(locationMessage.createdAt).format('HH:mm')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(siderbarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('HH:mm')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')


    const sendMessage = e.target.elements.message.value
    socket.emit('sendMessage', sendMessage, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value= ''
        $messageFormInput.focus()
        if(error) {
            return console.log(error);
        }
        console.log('The message was delivered!');
    } )
})

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('geolocation is not supported by your browser')
    }
    $sendLocationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude
        const long = position.coords.longitude
        const location = {lat, long}
        socket.emit('sendLocation', location, () => {
            console.log('Location shared!');
            $sendLocationButton.removeAttribute('disabled')
        } )
    })
})

socket.emit('join', { username, room}, (error)=> {
    if (error) {
        alert(error)  
        location.href ='/'
    }
} )
