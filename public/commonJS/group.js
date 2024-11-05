$(document).ready(function () {
  const socket = io('ws://34.116.165.2:3001/group', {
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

  //#region update Group Info
  socket.on('sendGroupInfo', (info) => {
    const messagesCount =
      info.messages === 0 ? 'No messaages yet.' : info.messages;
    const participants =
      info.participants.length > 0
        ? info.participants.join(', ')
        : 'No participants yet.';

    $('#messagesNumber').text(messagesCount);
    $('#participants').text(participants);
    $('#creator').text(info.creator);
    $('#groupName').attr('placeholder', info.name);
    $('.group-info-picture').css({ backgroundImage: `url(${info.picture})` });

    if (currentUserId === info.creatorId) {
      $('#editButton').show();
    }
  });

  function appendSystemMessage(message) {
    $('.chat-messages').append(`
      <p class="system-message">Group creator ${message}</p>
    `);
  }

  socket.on('getGroupUpdates', (info) => {
    if (info.picture) {
      $('.profile-image-container').css({
        backgroundImage: `url(${info.picture})`,
      });
      appendSystemMessage('changed group picture.');
    }

    if (info.groupName) {
      $('#group-name-title').text(info.groupName);
      appendSystemMessage(`changed group name to ${info.groupName}.`);
    }

    if (info.participants) {
      $('#group-name-title').text(info.groupName);
      const addedParticipants = info.participants.join(', ');
      appendSystemMessage(`invited user(-s) to chat: ${addedParticipants}.`);
    }
    $('.chat-messages').scrollTop($('.chat-messages')[0].scrollHeight);
  });

  $('#groupSettingsButton').on('click', function () {
    socket.emit('getGroupInfo', $.urlParam('groupId'));
    $('#popupContainer').fadeIn();
  });

  $('.close-popup').on('click', function () {
    quitEditMode();
    $('#popupContainer').fadeOut();
  });

  $('.group-info-picture').on('click', function () {
    $('#fileInput').click();
  });

  function enterEditMode() {
    const button = $('#editButton');
    button.text('Save').removeClass('edit-mode').addClass('save-mode');
    $('#groupName').removeAttr('disabled');
    $('.group-info-picture').css({ border: '2px dashed #7c5adb' });
    $('.group-info-picture').css('pointer-events', 'auto');
    $('#participants').hide();
    $('#participantsInput').show();
    $('#participantsInput').attr('placeholder', $('#participants').text());
  }

  function quitEditMode() {
    const button = $('#editButton');
    button.text('Edit').removeClass('save-mode').addClass('edit-mode');
    $('#groupName').attr('disabled', 'disabled');
    $('.group-info-picture').css({ border: '' });
    $('.group-info-picture').css('pointer-events', 'none');
    $('#participants').show();
    $('#participantsInput').hide();
  }

  function updateGroupInfo() {
    const groupName = $('#groupName').val() || null;
    const participants = $('#participantsInput').val().trim()
      ? $('#participantsInput')
          .val()
          .trim()
          .split(',')
          .map((user) => user.trim())
      : null;

    let picture;
    try {
      picture = $('#fileInput')[0].files[0].name;
    } catch (err) {
      picture = null;
    }
    const groupId = $.urlParam('groupId');

    if (groupName || participants || picture) {
      socket.emit('updateGroupInfo', {
        groupId,
        name: groupName,
        usersToAdd: participants,
        pictureName: picture,
      });

      $('#fileInput').val('');
      $('#participantsInput').val('');
      $('#groupName').val('');
      $('#popupContainer').fadeOut();
    }
  }

  $('#fileInput').on('change', function (event) {
    var file = event.target.files[0];
    if (file) {
      var reader = new FileReader();
      reader.onload = function (e) {
        $('.group-info-picture').css({
          backgroundImage: `url(${e.target.result})`,
        });
      };
      reader.readAsDataURL(file);
    }
  });

  $('#editButton').on('click', function () {
    const button = $(this);

    if (button.hasClass('edit-mode')) {
      enterEditMode();
    } else if (button.hasClass('save-mode')) {
      updateGroupInfo();
      quitEditMode();
    }
  });
  //#endregion

  socket.on('error', (err) => {
    alert(err.message);
  });
});
