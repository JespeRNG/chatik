$(document).ready(function () {
  const socket = io('localhost:3001/group', {
    withCredentials: true,
    transports: ['websocket', 'polling'],
  });

  let currentUserId = null;

  $.urlParam = function (name) {
    var results = new RegExp('[?&]' + name + '=([^&#]*)').exec(
      window.location.href,
    );
    return results[1] || 0;
  };

  socket.on('connect', () => {
    socket.emit('joinToGroup', $.urlParam('groupId'));
    socket.emit('sendAllMessages', $.urlParam('groupId'));
  });

  socket.on('user', (userId) => {
    currentUserId = userId;
  });

  // Function for converting to 12 hrs format. Example: "25 Aug 9:13 PM"
  function formatDateToLocalTime(dateString) {
    const date = new Date(dateString);

    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });

    const timeOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };
    const timeString = date.toLocaleTimeString('en-US', timeOptions);

    return `${day} ${month} ${timeString}`;
  }

  function sendMsgToSocket() {
    const content = $('#message-input').val().trim();

    if (content) {
      socket.emit('getMessage', {
        groupId: $.urlParam('groupId'),
        content: content,
      });
      $('#message-input').val('');
    }
  }

  $('#message-input').on('keydown', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      sendMsgToSocket();
    }
  });

  $('#send-button').on('click', function () {
    sendMsgToSocket();
  });

  socket.on('sendMessage', (msg) => {
    const messageClass =
      msg.senderId === currentUserId ? 'my-message' : 'friends-message';

    $('.chat-messages').append(`
      <div class="message ${messageClass}">
        ${messageClass === 'friends-message' ? `<p class="message-author">${msg.senderUsername}</p>` : ''}
        <p class="message-text">${msg.content}</p>
        <p class="message-timestamp">${formatDateToLocalTime(msg.createdAt)}</p>
      </div>
    `);

    $('.chat-messages').scrollTop($('.chat-messages')[0].scrollHeight);
  });

  socket.on('sendAllMessages', ({ allMessages }) => {
    for (let msg of allMessages) {
      let messageClass =
        currentUserId === msg.userId ? 'my-message' : 'friends-message';

      $('.chat-messages').append(`
        <div class="message ${messageClass}">
          ${
            messageClass === 'friends-message'
              ? `<p class="message-author">${msg.senderUsername}</p>`
              : ''
          }
          <p class="message-text">${msg.content}</p>
          <p class="message-timestamp">${formatDateToLocalTime(
            msg.createdAt,
          )}</p>
        </div>
      `);
    }

    $('.chat-messages').scrollTop($('.chat-messages')[0].scrollHeight);
  });
});