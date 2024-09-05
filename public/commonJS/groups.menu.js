$(document).ready(function () {
  const socket = io('ws://localhost:3001/menu', {
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

  function sortTimelineItems() {
    const items = $('.timeline-item').get();

    items.sort((a, b) => {
      const dateStrA = $(a)
        .find('.timeline-item-content-text-date')
        .text()
        .trim();
      const dateStrB = $(b)
        .find('.timeline-item-content-text-date')
        .text()
        .trim();

      // Try to parse the dates
      const dateObjA = new Date(dateStrA);
      const dateObjB = new Date(dateStrB);

      if (isNaN(dateObjA.getTime()) || isNaN(dateObjB.getTime())) {
        console.error('Invalid date:', dateStrA, dateStrB);
        return 0; // Return 0 to keep the order unchanged
      }

      // Sort by most recent date first
      return dateObjB - dateObjA;
    });

    $('.timeline').empty().append(items);
  }

  function sortTimelineItems() {
    const items = $('.timeline-item').get();

    items.sort((a, b) => {
      const dateStrA = $(a)
        .find('.timeline-item-content-text-date')
        .text()
        .trim();
      const dateStrB = $(b)
        .find('.timeline-item-content-text-date')
        .text()
        .trim();

      const dateObjA = new Date(dateStrA);
      const dateObjB = new Date(dateStrB);

      if (isNaN(dateObjA.getTime()) || isNaN(dateObjB.getTime())) {
        console.error('Invalid date:', dateStrA, dateStrB);
        return 0;
      }

      return dateObjB - dateObjA;
    });

    $('.timeline').empty().append(items);
  }

  $('#createGroupButton').on('click', function () {
    const groupName = $('#groupNameInput').val().trim();
    const usersToAdd = $('#participantsInput')
      .val()
      .trim()
      .split(',')
      .map((user) => user.trim())
      .filter((user) => user.length > 0);

    const groupPicName = $('#fileInput')[0].files[0].name;

    socket.emit('receiveNewGroup', { groupName, usersToAdd, groupPicName });
    $('#popupContainer').fadeOut();
  });

  socket.on('connect', () => {
    socket.emit('getRelatedGroups');
  });

  socket.on('sendGroupsToClient', (groups) => {
    let items = [];

    groups.forEach((el) => {
      const lastMessage = el.lastMessage || {};

      let lastMessageCreatedAt = '';

      if (lastMessage && lastMessage.createdAt) {
        lastMessageCreatedAt = formatDateToLocalTime(lastMessage.createdAt);
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
        createdAt: new Date(lastMessage.createdAt),
        Date,
      });
    });

    items.sort((a, b) => b.createdAt - a.createdAt);

    $('.timeline').empty();
    items.forEach((item) => {
      $('.timeline').append(item.html);
    });
  });

  socket.on('sendNewGroup', (group) => {
    $('.timeline').append(`
      <div class='timeline-item'>
        <a href="/group?groupId=${group.id}" style="text-decoration: none;">
          <div class='timeline-item-content'>
            <div class='timeline-item-content-image' style="background-image: url(${group.picture}); background-size: cover; background-position: center;">
            </div>
            <div class='timeline-item-content-text'>
              <div class='timeline-item-content-header'>
                <p class='timeline-item-content-text-sender'></p>
                <p class='timeline-item-content-text-date'>
                  
                </p>
              </div>
              <p class='timeline-item-content-text-message'>
                No messages yet.
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
    console.log(`${groupPicture}\n${groupName}`);

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
        .find('.timeline-item-content-text-message')
        .text(info.groupName);
    }
  });

  socket.on('error', (err) => {
    alert(err.message);
  });
});
