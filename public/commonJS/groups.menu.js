$(document).ready(function () {
  const socket = io('ws://34.116.165.2:3001/menu', {
    withCredentials: true,
    transports: ['websocket', 'polling'],
  });

  function formatDateToLocalTime(dateString) {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      console.error('Invalid date string:', dateString);
      return '';
    }

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

  $('#createGroupButton').on('click', function () {
    const name = $('#groupNameInput').val().trim();
    const usersToAdd = $('#participantsInput')
      .val()
      .trim()
      .split(',')
      .map((user) => user.trim())
      .filter((user) => user.length > 0);

    const pictureName = $('#fileInput')[0].files[0]
      ? $('#fileInput')[0].files[0].name
      : null;

    if (!name) {
      alert('Unable to create group. There is no group name.');
      return;
    }

    socket.emit('receiveNewGroup', { name, pictureName, usersToAdd });
    $('#popupContainer').fadeOut();
  });

  socket.on('connect', () => {
    socket.emit('getRelatedGroups');
  });

  socket.on('sendGroupsToClient', (groups) => {
    let items = [];
    if (groups.length > 0) {
      groups.forEach((el) => {
        const lastMessage = el.lastMessage || {};

        let lastMessageCreatedAt = '';
        let createdAtDate = el.createdAt ? new Date(el.createdAt) : new Date();

        if (lastMessage && lastMessage.createdAt) {
          lastMessageCreatedAt = formatDateToLocalTime(lastMessage.createdAt);
          createdAtDate = new Date(lastMessage.createdAt);
        }

        const lastMessageContent = lastMessage.content || 'No messages yet.';

        items.push({
          id: el.id,
          html: `
            <div class='timeline-item' id="${el.id}">
              <a href="/group?groupId=${el.id}" style="text-decoration: none;">
                <div class='timeline-item-content'>
                  <div class='timeline-item-content-image' style="background-image: url(${el.picture}); background-size: cover; background-position: center;">
                  </div>
                  <div class='timeline-item-content-text'>
                    <div class='timeline-item-content-header'>
                      <p class='timeline-item-content-text-sender'>${el.creatorUsername || ''}</p>
                      <p class='timeline-item-content-text-date'>
                        ${lastMessageCreatedAt}
                      </p>
                    </div>
                    <p class='timeline-item-content-text-message'>
                      ${lastMessageContent}
                    </p>
                    <p class='timeline-item-content-text-group-name'>
                      ${el.name}
                    </p>
                    <p class='timeline-item-content-text-content-author'>
                      With Author & Viewers
                    </p>
                  </div>
                </div>
              </a>
            </div>
          `,
          createdAt: createdAtDate,
        });
      });

      items.sort((a, b) => b.createdAt - a.createdAt);

      $('.timeline').empty();
      items.forEach((item) => {
        $('.timeline').append(item.html);
      });
    } else {
      $('.timeline').append(
        `<h1 id="noGroups_h1" style="margin-top: 80px; color: #4a3f69;" >You have not been added to any group yet<h1>`,
      );
    }
  });

  socket.on('sendNewGroup', (group) => {
    $('#noGroups_h1').remove();
    $('.timeline').append(`
      <div class='timeline-item' id=${group.id}>
        <a href="/group?groupId=${group.id}" style="text-decoration: none;">
          <div class='timeline-item-content'>
            <div class='timeline-item-content-image' style="background-image: url(${group.picture}); background-size: cover; background-position: center;">
            </div>
            <div class='timeline-item-content-text'>
              <div class='timeline-item-content-header'>
                <p class='timeline-item-content-text-sender'>${group.lastMessageSender ? group.lastMessageSender : ''}</p>
                <p class='timeline-item-content-text-date'>${group.lastMessageCreatedAt ? formatDateToLocalTime(group.lastMessageCreatedAt) : ''}</p>
              </div>
              <p class='timeline-item-content-text-message'>
                ${group.lastMessage ? group.lastMessage : 'No messages yet.'}
              </p>
              <p class='timeline-item-content-text-group-name'>
                ${group.name}
              </p>
              <p class='timeline-item-content-text-content-author'>
                With Author & Viewers
              </p>
            </div>
          </div>
        </a>
      </div>
    `);
  });

  socket.on('sendNewMessage', (msg) => {
    const groupDiv = $(`#${msg.groupId}`);
    const groupPicture = groupDiv
      .find('.timeline-item-content-image')
      .css('background-image')
      .replace(/^url\(["']?/, '')
      .replace(/["']?\)$/, '');
    const groupName = groupDiv
      .find('.timeline-item-content-text-group-name')
      .text();

    $(`#${msg.groupId}`).remove();

    $('.timeline').prepend(`
      <div class='timeline-item' id=${msg.groupId}>
        <a href="/group?groupId=${msg.groupId}" style="text-decoration: none;">
          <div class='timeline-item-content'>
            <div class='timeline-item-content-image' style="background-image: url(${groupPicture}); background-size: cover; background-position: center;">
            </div>
            <div class='timeline-item-content-text'>
              <div class='timeline-item-content-header'>
                <p class='timeline-item-content-text-sender'>${msg.senderUsername}</p>
                <p class='timeline-item-content-text-date'>
                  ${formatDateToLocalTime(msg.createdAt)}
                </p>
              </div>
              <p class='timeline-item-content-text-message'>
                ${msg.content}
              </p>
              <p class='timeline-item-content-text-group-name'>
                ${groupName}
              </p>
              <p class='timeline-item-content-text-content-author'>
                With Author & Viewers
              </p>
            </div>
          </div>
        </a>
      </div>
    `);
  });

  socket.on('getGroupUpdates', (info) => {
    const groupObject = $(`#${info.groupId}`);

    if (info.picture) {
      groupObject.find('.timeline-item-content-image').css({
        backgroundImage: `url(${info.picture})`,
      });
    }

    if (info.groupName) {
      groupObject
        .find('.timeline-item-content-text-group-name')
        .text(info.groupName);
    }
  });

  socket.on('error', (err) => {
    alert(err.message);
  });
});
