$(document).ready(function () {
  const socket = io('localhost:3001/menu', {
    withCredentials: true,
    transports: ['websocket', 'polling'],
  });

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

  socket.on('connect', () => {
    socket.emit('getRelatedGroups', { userId: 'user-id' });
  });

  socket.on('sendGroupsToClient', (groups) => {
    console.log(groups);
    $('.timeline').empty();
    groups.forEach((el) => {
      const lastMessage = el.lastMessage || {};

      let lastMessageCreatedAt = '';

      if (lastMessage && lastMessage.createdAt) {
        lastMessageCreatedAt = formatDateToLocalTime(lastMessage.createdAt);
      }

      const lastMessageContent = lastMessage.content || 'No messages yet.';

      $('.timeline').append(`
        <div class='timeline-item'>
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
      `);
    });
  });
});
