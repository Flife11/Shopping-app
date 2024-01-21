# Shopping-app

### Note:
- Hiển thị successful noti:  
  `$('#successNotificationtext').text('test')`  
  `$('#successNotificationModal').css('display', '');`
- Hiển thị failure noti:  
  `$('#failureNotificationText').text('test')`  
  `$('#failureNotificationModal').css('display', '');`
- Hiển thị confirm noti:  
  `$('#confirmNotificationText').text('test')`  
  `$('#confirmNotificationModal').css('display', '');`
  (gán event cho confirm button click: `$confirmConfirmModal on click`)

- Hiển thị số lượng sp trong giỏ:
  `$('#cart-count').show();`
  `$('#cart-count').text(cart.length);`
- Bỏ hiển thị số lượng sp trong giỏ (số sp = 0):
  `$('#cart-count').hide();`

- Error code (register):
  + 401: username error
  + 402: password error
  + 403: email error
- Role:
  + client
  + admin

- req.session.passport.user