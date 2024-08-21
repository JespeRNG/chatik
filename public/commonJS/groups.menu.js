const socket = io('localhost:3001/menu', {
  withCredentials: true,
  transports: ['websocket', 'polling'],
});

socket.on('connect', () => {
  socket.emit('getRelatedGroups', { userId: 'user-id' });
});

socket.on('sendGroupsToClient', (groups) => {
  $('.timeline').empty();
  groups.forEach((el) => {
    $('.timeline').append(`
        <div class='timeline-item'>
          <div class='timeline-item-content'>
            <div class='timeline-item-content-image' style="background-image: url(${el.picture}); background-size: cover; background-position: center;">
            </div>
            <div class='timeline-item-content-text'>
              <div class='timeline-item-content-header'>
                <p class='timeline-item-content-text-sender'>Sender</p>
                <p class='timeline-item-content-text-date'>
                  12 Jan 2023, 4:32 pm
                </p>
              </div>
              <p class='timeline-item-content-text-message'>
                This is a message
              </p>
              <p class='timeline-item-content-text-group-name'>
                ${el.name}
              </p>
              <p class='timeline-item-content-text-content-author'>
                With Author & Viewers
              </p>
            </div>
          </div>
        </div>
      `);
  });
  $('.timeline').append(`
      <a href='#' class='timeline-item-content-text-loadmore'>Load more</a>  
    `);
});
